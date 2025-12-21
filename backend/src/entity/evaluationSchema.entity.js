"use strict";
import { EntitySchema } from "typeorm";

const EvaluacionEstudianteSchema = new EntitySchema({
    name: "EvaluacionEstudiante",
    tableName: "evaluaciones_estudiantes",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        puntaje_obtenido: {
            type: "int",
            nullable: false,
        },
        nota: {
            type: "decimal",
            precision: 3,
            scale: 1,
            nullable: false,
        },
        fecha_evaluacion: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        estudiante: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "id_estudiante" },
        },
        pauta: {
            type: "many-to-one",
            target: "Pauta",
            joinColumn: { name: "id_pauta" },
        },
    },
});

export default EvaluacionEstudianteSchema;