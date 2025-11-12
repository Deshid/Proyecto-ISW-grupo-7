"use strict";
import { EntitySchema } from "typeorm";

const GrupoSchema = new EntitySchema({
  name: "Grupo",
  tableName: "grupos",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre_grupo: {
      type: "varchar",
      length: 255,
      nullable: false,
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
    profesor_responsable: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_profesor_responsable" },
      nullable: false,
    },
  },
});

export default GrupoSchema;
