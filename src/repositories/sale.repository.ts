import { SQS } from "aws-sdk";

import { PaymentConfirmation, SalesVehicleDTO } from "../dto";
import { VehicleProvider } from "../providers";
import { pool, ReservationStatus, Sale, SalesStatus, Topic } from "../utils";
import { ReservationRepository } from "./reservation.repository";
import { NotFoundReservationException } from "../exceptions";
import { AuthProvider } from "../middlewares";

export class SaleRepository {
  async CreateSalesRequest(
    { reservationId }: SalesVehicleDTO,
    auth: AuthProvider
  ) {
    const reservationRepository = new ReservationRepository();
    const vehicleProvider = new VehicleProvider();

    const reservation = await reservationRepository.GetReservationById(
      reservationId
    );
    if (reservation.user_id !== auth.getUserId())
      throw new NotFoundReservationException("Vehicle already reserved");

    const vehicle = await vehicleProvider.GetVehicleById(
      reservation.vehicle_id
    );

    const query = `
        INSERT INTO sales (reservation_id, price, payment_id, status)
        VALUES($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [reservation.id, vehicle.price, 0, SalesStatus.PENDING];

    const result = await pool.query(query, values);

    const sqs = new SQS();
    const userData = await auth.getUserData();

    await sqs
      .sendMessage({
        QueueUrl: process.env.SQS_QUEUE_URL!,
        MessageBody: JSON.stringify({
          topic: Topic.CREATE_SALES_REQUESTS,
          data: {
            sale: result.rows[0],
            user: userData,
          },
        }),
      })
      .promise();

    return result.rows[0];
  }

  async getSaleById(saleId: number): Promise<Sale> {
    const query = `SELECT * FROM sales WHERE id = $1`;
    const values = [saleId];

    const result = await pool.query(query, values);

    return result.rows[0];
  }

  async processesPaymentForTheSale({ saleId, status }: PaymentConfirmation) {
    const sqs = new SQS();

    const sale = await this.getSaleById(saleId);

    console.debug("[SaleRepository][processesPaymentForTheSale]|[sale]", sale);
    console.debug(
      "[SaleRepository][processesPaymentForTheSale]|[status]",
      status
    );

    if (status === "PAID") {
      const saleUpdated = await this.processPayment(
        sale.id!,
        SalesStatus.CONCLUDED,
        "sales"
      );

      const reservationUpdated = await this.processPayment(
        sale.reservation_id,
        ReservationStatus.CONCLUDED,
        "reservations"
      );

      await sqs
        .sendMessage({
          QueueUrl: process.env.SQS_QUEUE_URL!,
          MessageBody: JSON.stringify({
            topic: Topic.CONCLUDED_SALE,
            data: {
              sale: saleUpdated,
              reservation: reservationUpdated,
            },
          }),
        })
        .promise();
    } else {
      const saleUpdated = await this.processPayment(
        sale.id!,
        SalesStatus.CANCELLED,
        "sales"
      );
      const reservationUpdated = await this.processPayment(
        sale.reservation_id,
        ReservationStatus.CANCELLED,
        "reservations"
      );

      await sqs
        .sendMessage({
          QueueUrl: process.env.SQS_QUEUE_URL!,
          MessageBody: JSON.stringify({
            topic: Topic.CANCELLED_SALE,
            data: {
              sale: saleUpdated,
              reservation: reservationUpdated,
            },
          }),
        })
        .promise();
    }
  }

  private async processPayment(
    saleId: number,
    status: SalesStatus | ReservationStatus,
    table: string
  ) {
    const query = `
        UPDATE ${table} SET status = $1 WHERE id = $2
        RETURNING *;
    `;

    const values = [status, saleId];

    const result = await pool.query(query, values);

    return result.rows[0];
  }
}
