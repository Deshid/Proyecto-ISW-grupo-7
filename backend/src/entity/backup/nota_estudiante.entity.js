"use strict";
import { EntitySchema } from "typeorm";

const NotaEstudianteSchema = new EntitySchema({
  name: "NotaEstudiante",
  tableName: "notas_estudiante",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nota_final_calculada: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    nota_final_manual: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    fecha_asignacion: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    evento: {
      target: "EventoEvaluacion",
      type: "many-to-one",
      joinColumn: { name: "id_evento_eval" },
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

export default NotaEstudianteSchema;
