"use strict";
import { EntitySchema } from "typeorm";

const ItemPautaSchema = new EntitySchema({
  name: "ItemPauta",
  tableName: "items_pauta",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    descripcion: {
      type: "text",
      nullable: false,
    },
    puntaje_maximo: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
  },
  relations: {
    pauta: {
      target: "Pauta",
      type: "many-to-one",
      joinColumn: { name: "id_pauta" },
      nullable: false,
    },
  },
});

export default ItemPautaSchema;
