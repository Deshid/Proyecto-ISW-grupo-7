"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD } from "./configEnv.js";
// Explicit entity imports: limit TypeORM to only the entities needed for the Solicitudes feature
import User from "../entity/user.entity.js";
import Solicitud from "../entity/solicitud.entity.js";
import SolicitudRecuperacion from "../entity/solicitud_recuperacion.entity.js";
import SolicitudRevision from "../entity/solicitud_revision.entity.js";
import SolicitudRevisionDetalle from "../entity/solicitud_revision_detalle.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: 5432,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: [
    User,
    Solicitud,
    SolicitudRecuperacion,
    SolicitudRevision,
    SolicitudRevisionDetalle,
  ],
  synchronize: true,
  logging: false,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos!");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}