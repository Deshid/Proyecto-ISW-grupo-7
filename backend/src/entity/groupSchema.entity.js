"use strict";
import { EntitySchema } from "typeorm";

const GroupSchema = new EntitySchema({
    name: "Group",
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
    },
    relations: {
    profesor: {
        type: "many-to-one",
        target: "User",
        joinColumn: { name: "id_profesorResponsable" },
    },
    },
});

export default GroupSchema;