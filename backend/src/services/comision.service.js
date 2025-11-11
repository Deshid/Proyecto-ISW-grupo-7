"use strict";
import Lugar from "../entity/lugar.entity.js";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";

/* Crear horario */
export async function createHorarioService(id_lugar, fecha, horaInicio, horaFin) {
    try {
        const lugarRepository = AppDataSource.getRepository(Lugar);
        const lugar = await lugarRepository.findOneBy({ id_lugar: id_lugar });
        if (!lugar) {
            throw new Error("Lugar no encontrado");
        }
        const horarioRepository = AppDataSource.getRepository("Horario");
        const nuevoHorario = horarioRepository.create({
            lugar: lugar,
            fecha: fecha,
            horaInicio: horaInicio,
            horaFin: horaFin,
        });
        await horarioRepository.save(nuevoHorario);
        return nuevoHorario;
    } catch (error) {
        console.error("Error al crear horario:", error);
        return [null, "Error interno del servidor"];
    }
}
/* Obtener horarios por lugar */
export async function getHorariosPorLugarService(id_lugar) {
    try {
        const horarioRepository = AppDataSource.getRepository("Horario");
        const horarios = await horarioRepository.find({
            where: { lugar: { id_lugar: id_lugar } },
            relations: ["lugar"],
        });
        return horarios;
    }
    catch (error) {
        console.error("Error al obtener horarios:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Actualizar horario */
export async function actualizarHorarioService(id_horario, fecha, horaInicio, horaFin) {
    try {
        const horarioRepository = AppDataSource.getRepository("Horario");
        const horario = await horarioRepository.findOneBy({ id_horario: id_horario });
        if (!horario) {
            return [null, "Horario no encontrado"];
        }
        horario.fecha = fecha;
        horario.horaInicio = horaInicio;
        horario.horaFin = horaFin;
        await horarioRepository.save(horario);
        return [horario, null];
    } catch (error) {
        console.error("Error al actualizar horario:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Eliminar horario */
export async function eliminarHorarioService(id_horario) {
    try {
        const horarioRepository = AppDataSource.getRepository("Horario");
        const horario = await horarioRepository.findOneBy({ id_horario: id_horario });
        if (!horario) {
            return [null, "Horario no encontrado"];
        }
        await horarioRepository.remove(horario);
        return [horario, null];
    } catch (error) {
        console.error("Error al eliminar horario:", error);
        return [null, "Error interno del servidor"];
    }
}