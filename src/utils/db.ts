import { Pool } from "pg";
import { SCHEMAS } from "../schemas";

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

(async () => {
  try {
    await pool.query(SCHEMAS.join("\n"));
    console.log("Tabelas verificadas/criadas com sucesso.");
  } catch (error) {
    console.error("Erro ao criar tabelas:", error);
  }
})();
