"use strict";
import { EntitySchema } from "typeorm";

const EventoEvaluacionSchema = new EntitySchema({
  name: "EventoEvaluacion",
  tableName: "eventos_evaluacion",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre_evento: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    fecha_hora_inicio: {
      type: "timestamp with time zone",
      nullable: true,
    },
    lugar: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
  relations: {
    grupo: {
      target: "Grupo",
      type: "many-to-one",
      joinColumn: { name: "id_grupo" },
      nullable: false,
    },
    pauta: {
      target: "Pauta",
      type: "many-to-one",
      joinColumn: { name: "id_pauta" },
      nullable: false,
    },
    admin_creador: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_admin_creador" },
      nullable: false,
    },
  },
});

export default EventoEvaluacionSchema;
