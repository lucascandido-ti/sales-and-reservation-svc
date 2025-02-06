import { ReserveVehicleDTO } from "../dto";
import { VehicleProvider } from "../providers";
import { pool, ReservationStatus } from "../utils";
import { NotAvailableVehicleException } from "../exceptions";
import { SQS } from "aws-sdk";

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
        MessageBody: JSON.stringify({ reservation: result.rows[0] }),
      })
      .promise();

    return result.rows[0];
  }
}
