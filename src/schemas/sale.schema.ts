export const SalesSchema = `
  CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    reservation_id SERIAL NOT NULL,
    payment_id INTEGER NOT NULL,
    price FLOAT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'CANCELLED', 'CONCLUDED'))
  );

  ALTER TABLE sales ADD CONSTRAINT FK_Sales_Reservations_reservationId FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE;
`;
