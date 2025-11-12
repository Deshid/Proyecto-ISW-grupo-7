"use strict";
import { EntitySchema } from "typeorm";

const GrupoEstudiantesSchema = new EntitySchema({
  name: "GrupoEstudiantes",
  tableName: "grupo_estudiantes",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
  },
  relations: {
    grupo: {
      target: "Grupo",
      type: "many-to-one",
      joinColumn: { name: "id_grupo" },
      nullable: false,
    },
    estudiante: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_estudiante" },
      nullable: false,
    },
  },
});

export default GrupoEstudiantesSchema;
