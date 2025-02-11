import { IsNumber, IsString } from "class-validator";

export class PaymentConfirmation {
  @IsString()
  paymentId: string;

  @IsNumber()
  saleId: number;

  status: "PAID" | "FAILED";
}
