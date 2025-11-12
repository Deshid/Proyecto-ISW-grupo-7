"use strict";
import { EntitySchema } from "typeorm";

const SolicitudSchema = new EntitySchema({
  name: "Solicitud",
  tableName: "solicitudes",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    tipo: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    notas: {
      type: "simple-array",
      nullable: true,
    },
    modalidad: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    evidenciaPath: {
      type: "varchar",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "pendiente",
    },
    justificacionProfesor: {
      type: "text",
      nullable: true,
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    updatedAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    alumno: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
    },
  },
});

export default SolicitudSchema;
