"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD } from "./configEnv.js";
import UserSchema from "../entity/user.entity.js";
import LugarSchema, { HorarioSchema } from "../entity/lugar.entity.js";
import SolicitudSchema from "../entity/solicitud.entity.js";

import SubjectSchema from "../entity/subject.entity.js";
import UserSubjectSchema from "../entity/userSubject.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: 5432,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: [SubjectSchema, UserSubjectSchema, UserSchema, LugarSchema, HorarioSchema, SolicitudSchema, SolicitudRevisionSchema],
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