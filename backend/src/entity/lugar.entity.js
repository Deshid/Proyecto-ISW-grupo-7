"use strict";
import { EntitySchema } from "typeorm";

export const LugarSchema = new EntitySchema({
    name: "Lugar",
    tableName: "lugar",
    columns: {
        id_lugar: {
            primary: true,
            type: "int",
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 100,
        },
        descripcion: {
            type: "text",
        },
        ubicacion: {
            type: "varchar",
            length: 255,
        },
    },
    relations: {
        usuario: {
            type: "many-to-one",
            target: "User",
            joinColumn: true,
            cascade: true,
        },
    },
});

export const HorarioSchema = new EntitySchema({
    name: "Horario",
    tableName: "horario",
    columns: {
        id_horario: {
            primary: true,
            type: "int",
            generated: true,
        },
        fecha: {
            type: "date",
        },
        horaInicio: {
            type: "time",
        },
        horaFin: {
            type: "time",
        },
    },
    relations: {
        lugar: {
            type: "many-to-one",
            target: "Lugar",
            joinColumn: true,
            cascade: true,
        },
        usuario: {
            type: "many-to-one",
            target: "User",
            joinColumn: true,
            cascade: true,
        },
    },
});
