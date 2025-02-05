export const ReservationsSchema = `
  CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    vehicle_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('RESERVED', 'CANCELLED', 'CONCLUDED'))
  );
`;
