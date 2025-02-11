import { IsNotEmpty, IsNumber } from "class-validator";

export class SalesVehicleDTO {
  @IsNumber()
  @IsNotEmpty()
  reservationId: number;
}
