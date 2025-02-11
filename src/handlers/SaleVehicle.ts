import { APIGatewayEvent } from "aws-lambda";

import { SalesVehicleDTO } from "../dto";
import { AuthProvider } from "../middlewares";
import { SaleRepository } from "../repositories";
import { validateDto } from "../utils/validation";

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return { statusCode: 400, body: "Request body is missing" };
  }
  const auth = new AuthProvider(event);

  try {
    const dto = await validateDto(SalesVehicleDTO, JSON.parse(event.body));
    const repository = new SaleRepository();

    const result = await repository.CreateSalesRequest(dto, auth);

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error("Error on reservation vehicle:", error);
    return { statusCode: error.statusCode, body: error.message };
  }
};
