"use strict";
import { EntitySchema } from "typeorm";

const SolicitudRecuperacionSchema = new EntitySchema({
  name: "SolicitudRecuperacion",
  tableName: "solicitudes_recuperacion",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    descripcion_caso: {
      type: "text",
      nullable: false,
    },
    url_evidencia: {
      type: "varchar",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "pendiente",
    },
    justificacion_profesor: {
      type: "text",
      nullable: true,
    },
    id_evento_eval: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    estudiante: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_estudiante" },
      nullable: false,
    },
  },
});

export default SolicitudRecuperacionSchema;
