export const SalesSchema = `
  CREATE TABLE IF NOT EXISTS payment (
    id SERIAL PRIMARY KEY,
    sale_id SERIAL NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (status IN ('QRCode', 'Credit'))
    price FLOAT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'ERROR', 'CANCELLED', 'CONCLUDED'))
  );

  ALTER TABLE sales ADD CONSTRAINT FK_Sales_Reservations_reservationId FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE;
`;
