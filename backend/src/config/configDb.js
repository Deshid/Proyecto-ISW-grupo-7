"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD } from "./configEnv.js";
import UserSchema from "../entity/user.entity.js";
import LugarSchema, { HorarioSchema } from "../entity/lugar.entity.js";
import SolicitudSchema from "../entity/solicitud.entity.js";
import PautaSchema from "../entity/pautaSchema.entity.js";
import ItemPautaSchema from "../entity/itemPautaSchema.entity.js";
import EvaluacionEstudianteSchema from "../entity/evaluationSchema.entity.js"; 


export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: 5432,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: [
    UserSchema, 
    LugarSchema, 
    HorarioSchema, 
    SolicitudSchema,
    PautaSchema,
    ItemPautaSchema,
    EvaluacionEstudianteSchema,
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