import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { validateDto } from "../utils/validation";
import { ReserveVehicleDTO } from "../dto";
import { ReservationRepository } from "../repositories";
import { AuthProvider } from "../middlewares";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return { statusCode: 400, body: "Request body is missing" };
  }

  try {
    const auth = new AuthProvider(event);
    const { userId } = await auth.validateUser();

    const dto = await validateDto(ReserveVehicleDTO, JSON.parse(event.body));
    const repository = new ReservationRepository();

    const result = await repository.CreateReservation(dto, userId);

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error("Error on reservation vehicle:", error);
    return { statusCode: error.statusCode, body: error.message };
  }
};
