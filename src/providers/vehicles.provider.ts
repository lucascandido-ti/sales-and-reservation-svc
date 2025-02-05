import { Vehicle } from "../utils/interfaces";

import axios, { AxiosInstance } from "axios";

export class VehicleProvider {
  private readonly axios: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.axios = axios;
    this.baseUrl = process.env.VEHICLE_API_BASE_URL!;
  }

  public async GetVehicleById(vehicleId: number): Promise<Vehicle> {
    const response = await this.axios.get(`${this.baseUrl}/${vehicleId}`);
    const result = response.data as Vehicle;

    return result;
  }
}
