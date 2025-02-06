import { IsNotEmpty, IsNumber } from "class-validator";

export class ReserveVehicleDTO {
  @IsNumber()
  @IsNotEmpty()
  vehicleId: number;
}
