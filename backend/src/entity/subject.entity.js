"use strict";
import { EntitySchema } from "typeorm";

const SubjectSchema = new EntitySchema({
    name: "Subject",
    tableName: "subjects",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
    },
    indices: [
        {
            name: "IDX_SUBJECT",
            columns: ["id"],
            unique: true,
        },
    ],
});

export { SubjectSchema };