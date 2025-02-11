import { SQS } from "aws-sdk";

import {
  NotAvailableVehicleException,
  NotFoundReservationException,
} from "../exceptions";
import { ReserveVehicleDTO } from "../dto";
import { VehicleProvider } from "../providers";
import { pool, Reservation, ReservationStatus, Topic } from "../utils";

export class ReservationRepository {
  async CreateReservation({ vehicleId }: ReserveVehicleDTO, userId: string) {
    const vehicleProvider = new VehicleProvider();
    const vehicule = await vehicleProvider.GetVehicleById(vehicleId);

    if (vehicule.status !== "AVAILABLE")
      throw new NotAvailableVehicleException("Vehicle not available");

    const query = `
            INSERT INTO reservations (user_id, vehicle_id, status)
            VALUES($1, $2, $3)
            RETURNING *;
        `;
    const values = [userId, vehicleId, ReservationStatus.RESERVED];

    const result = await pool.query(query, values);

    const sqs = new SQS();

    await sqs
      .sendMessage({
        QueueUrl: process.env.SQS_QUEUE_URL!,
        MessageBody: JSON.stringify({
          topic: Topic.CREATE_RESERVATION,
          data: result.rows[0],
        }),
      })
      .promise();

    return result.rows[0];
  }

  async GetReservationById(reservationId: number): Promise<Reservation> {
    const query = `
      SELECT * FROM reservations
      WHERE id = $1
      AND status = $2
    `;
    const params = [reservationId, ReservationStatus.RESERVED];

    const result = await pool.query(query, params);

    if (!result.rows.length)
      throw new NotFoundReservationException("Reservation not found");

    return result.rows[0];
  }

  async ConcludedReservation(reservationId: number) {
    const query = `
        UPDATE reservations SET status = $1 WHERE id = $2
        RETURNING *;
    `;

    const values = [ReservationStatus.CONCLUDED, reservationId];

    const result = await pool.query(query, values);

    const sqs = new SQS();

    await sqs
      .sendMessage({
        QueueUrl: process.env.SQS_QUEUE_URL!,
        MessageBody: JSON.stringify({
          topic: Topic.CONCLUDED_RESERVATION,
          data: result.rows[0],
        }),
      })
      .promise();
  }
}
