"use strict";
import { EntitySchema } from "typeorm";

const PautaSchema = new EntitySchema({
    name: "Pauta",
    tableName: "pautas",
    columns: {
        id: {
        type: "int",
        primary: true,
        generated: true,
    },
    nombre_pauta: {
        type: "varchar",
        length: 255,
        nullable: false,
    },
    fecha_modificacion: {
        type: "timestamp with time zone",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        nullable: false,
    },
        porcentaje_escala: {
        type: "decimal",
        precision: 5,
        scale: 2,   
        nullable: false,
        default: 51,
    },
    },
    relations: {
        creador: {
        type: "many-to-one",
        target: "User",
        joinColumn: { name: "id_profesorCreador" },
    },
    items: {
        type: "one-to-many",
        target: "ItemPauta",
        inverseSide: "pauta",
    },
    },
});

export default PautaSchema;