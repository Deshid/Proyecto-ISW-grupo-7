"use strict";
import { EntitySchema } from "typeorm";

const TemaSchema = new EntitySchema({
  name: "Tema",
  tableName: "temas",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre_tema: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
  },
  relations: {
    profesor_creador: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_profesor_creador" },
      nullable: false,
    },
  },
});

export default TemaSchema;
