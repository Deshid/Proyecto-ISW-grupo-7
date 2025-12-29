"use strict";
import { EntitySchema } from "typeorm";

const DetalleEvaluacionSchema = new EntitySchema({
    name: "DetalleEvaluacion",
    tableName: "detalles_evaluacion",
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
        comentario: {
            type: "text",
            nullable: true,
        },
    },
    relations: {
        evaluacion: {
            type: "many-to-one",
            target: "EvaluacionEstudiante",
            joinColumn: { name: "id_evaluacion" },
        },
        item: {
            type: "many-to-one",
            target: "ItemPauta",
            joinColumn: { name: "id_item" },
        },
    },
});

export default DetalleEvaluacionSchema;