import { EventBridgeEvent } from "aws-lambda";
import { PaymentConfirmation } from "../dto/payment-confirmation.dto";
import { SaleRepository } from "../repositories";

export const handler = async (
  event: EventBridgeEvent<
    "PaymentCreated" | "PaymentCancelled",
    PaymentConfirmation
  >
) => {
  const paymentConfirmation = event.detail;

  console.debug(
    "[PaymentConfirmation][handler]|[event] => ",
    JSON.stringify(paymentConfirmation)
  );

  try {
    const repository = new SaleRepository();

    const result = await repository.processesPaymentForTheSale(
      paymentConfirmation
    );

    console.debug(
      "[PaymentConfirmation][handler]|[result] => ",
      JSON.stringify(result)
    );
    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error("Error on process payment:", error);
    return { statusCode: error.statusCode, body: error.message };
  }
};
