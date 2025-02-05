-- Extensão uuid-ossp.control disponível fornecida pelo pacote postgresql-contrib para geração de UUID
-- https://www.postgresql.org/docs/current/uuid-ossp.html
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criação do usuário sistêmico com acesso total ao schema public
CREATE USER _user_aplic WITH PASSWORD 'root';

GRANT ALL PRIVILEGES ON DATABASE tbmpdatabase TO _user_aplic;

GRANT CREATE ON DATABASE tbmpdatabase TO _user_aplic;

GRANT ALL PRIVILEGES ON SCHEMA public TO _user_aplic;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO _user_aplic;