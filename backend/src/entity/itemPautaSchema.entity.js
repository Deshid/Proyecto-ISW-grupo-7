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
        precision: 7,
        scale: 2,
        nullable: false,
    },
    },
    relations: {
    pauta: {
        type: "many-to-one",
        target: "Pauta",
        joinColumn: { name: "id_pauta" },
    },
    },
});

export default ItemPautaSchema;