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
        creatorId: {
            type: "int",
            nullable: true,
            name: "creator_id"
        },
    },
    indices: [
        {
            name: "IDX_SUBJECT",
            columns: ["id"],
            unique: true,
        },
    ],
    relations: {
        usuariosEncomendados: {  // Nombre más descriptivo
            type: "many-to-many",
            target: "User",      // Entidad relacionada
            joinColumn: {
                    name: "subject_id"
            },
        }
},
});

export default SubjectSchema;