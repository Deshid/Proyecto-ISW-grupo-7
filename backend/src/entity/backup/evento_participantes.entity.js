"use strict";
import { EntitySchema } from "typeorm";

const EventoParticipantesSchema = new EntitySchema({
  name: "EventoParticipantes",
  tableName: "evento_participantes",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    rol_en_evento: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    asistencia: {
      type: "boolean",
      nullable: true,
      default: false,
    },
  },
  relations: {
    evento: {
      target: "EventoEvaluacion",
      type: "many-to-one",
      joinColumn: { name: "id_evento_eval" },
      nullable: false,
    },
    usuario: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_usuario" },
      nullable: false,
    },
  },
});

export default EventoParticipantesSchema;
