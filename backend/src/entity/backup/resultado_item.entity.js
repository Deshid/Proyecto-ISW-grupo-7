"use strict";
import { EntitySchema } from "typeorm";

const ResultadoItemSchema = new EntitySchema({
  name: "ResultadoItem",
  tableName: "resultados_items",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    puntaje_obtenido: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
  },
  relations: {
    nota: {
      target: "NotaEstudiante",
      type: "many-to-one",
      joinColumn: { name: "id_nota" },
      nullable: false,
    },
    item_pauta: {
      target: "ItemPauta",
      type: "many-to-one",
      joinColumn: { name: "id_item_pauta" },
      nullable: false,
    },
  },
});

export default ResultadoItemSchema;
