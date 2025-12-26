// src/entities/UserSubject.entity.js
"use strict";
import { EntitySchema } from "typeorm";

const UserSubjectSchema = new EntitySchema({
    name: "UserSubject",
    tableName: "user_subjects", // Nombre de la tabla intermedia
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        userId: {
            type: "int",
            nullable: false,
        },
        subjectId: {
            type: "int",
            nullable: false,
        },
        assignedAt: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        }
    },
    indices: [
        {
            name: "IDX_USER_SUBJECT_UNIQUE",
            columns: ["userId", "subjectId"],
            unique: true, // Evita asignaciones duplicadas
        },
        {
            name: "IDX_USER_SUBJECT_USER",
            columns: ["userId"],
        },
        {
            name: "IDX_USER_SUBJECT_SUBJECT",
            columns: ["subjectId"],
        }
    ]
});

export default UserSubjectSchema;