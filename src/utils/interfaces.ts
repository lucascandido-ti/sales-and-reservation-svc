import { ReservationStatus, SalesStatus } from "./enum";

export interface Vehicle {
  id?: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  status: "AVAILABLE" | "SOLD" | "RESERVED";
}

export interface Reservation {
  id?: number;
  user_id: string;
  vehicle_id: number;
  status: ReservationStatus;
}

export interface Sale {
  id?: number;
  reservation_id: number;
  price: number;
  status: SalesStatus;
}

export interface IUser {
  id?: string;
  email?: string;
  phone_number?: string;
  name?: string;
  address?: string;
  cnh?: string;
  rg?: string;
  user_type?: string;
}
