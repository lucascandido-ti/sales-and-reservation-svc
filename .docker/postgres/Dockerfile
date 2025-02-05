FROM postgres:13

ENV POSTGRES_PASSWORD=root

COPY migrations/* /docker-entrypoint-initdb.d/

EXPOSE 5432
