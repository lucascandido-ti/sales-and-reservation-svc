import { ReservationsSchema } from "./reservations.schema";
import { SalesSchema } from "./sale.schema";

export * from "./reservations.schema";
export * from "./sale.schema";

export const SCHEMAS = [ReservationsSchema, SalesSchema];
