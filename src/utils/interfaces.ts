export interface Vehicle {
  id?: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  status: "AVAILABLE" | "SOLD" | "RESERVED";
}

export interface IUser {
  userId: string;
}
