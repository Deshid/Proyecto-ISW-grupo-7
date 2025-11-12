"use strict";
import { EntitySchema } from "typeorm";

const SolicitudRevisionSchema = new EntitySchema({
  name: "SolicitudRevision",
  tableName: "solicitudes_revision_notas",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    tipo_revision: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "pendiente",
    },
    fecha_solicitud: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    estudiante_solicitante: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_estudiante_solicitante" },
      nullable: false,
    },
  },
  evaluacion: {
  type: "varchar",
  length: 200,
  nullable: true,
},

});

export default SolicitudRevisionSchema;
