import { ReserveVehicleDTO } from "../dto";
import { VehicleProvider } from "../providers";
import { pool, ReservationStatus } from "../utils";
import { NotAvailableVehicleException } from "../exceptions";

export class ReservationRepository {
  async CreateReservation({ userId, vehicleId }: ReserveVehicleDTO) {
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

    return result.rows[0];
  }
}
