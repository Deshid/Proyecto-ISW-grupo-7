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
            return [null, "Lugar no encontrado"];
        }
        
        const horarioRepository = AppDataSource.getRepository("Horario");
        
        // Validar que no exista horario duplicado
        const horarioDuplicado = await horarioRepository.findOne({
            where: {
                lugar: { id_lugar: id_lugar },
                fecha: fecha,
                horaInicio: horaInicio,
                horaFin: horaFin,
            },
        });
        
        if (horarioDuplicado) {
            return [null, "Ya existe un horario con el mismo lugar, fecha y horas"];
        }
        
        const nuevoHorario = horarioRepository.create({
            lugar: lugar,
            fecha: fecha,
            horaInicio: horaInicio,
            horaFin: horaFin,
        });
        await horarioRepository.save(nuevoHorario);
        return [nuevoHorario, null];
    } catch (error) {
        console.error("Error al crear horario:", error);
        return [null, error.message || "Error interno del servidor"];
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

/* Asignar profesor a un horario */
export async function asignarProfesorAHorarioService(id_horario, id_profesor) {
    try {
        const horarioRepository = AppDataSource.getRepository("Horario");
        const userRepository = AppDataSource.getRepository(User);
        const horario = await horarioRepository.findOneBy({ id_horario: id_horario });
        if (!horario) {
            return [null, "Horario no encontrado"];
        }
        const profesor = await userRepository.findOneBy({ id: id_profesor, rol: "profesor" });
        if (!profesor) {
            return [null, "Profesor no encontrado"];
        }
        horario.profesor = profesor;
        await horarioRepository.save(horario);
        return [horario, null];
    } catch (error) {
        console.error("Error al asignar profesor al horario:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Obtener horarios por profesor */
export async function getHorariosPorProfesorService(id_profesor) {
    try {
        const horarioRepository = AppDataSource.getRepository("Horario");
        const horarios = await horarioRepository.find({
            where: { profesor: { id: id_profesor } },
            relations: ["lugar", "profesor"],
        });
        return horarios;
    } catch (error) {
        console.error("Error al obtener horarios por profesor:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Asignar estudiantes a profesor */
export async function asignarEstudiantesAProfesorService(id_profesor, listaEstudiantes) {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const profesor = await userRepository.findOneBy({ id: id_profesor, rol: "profesor" });
        if (!profesor) {
            return [null, "Profesor no encontrado"];
        }
        const estudiantes = await userRepository.findByIds(listaEstudiantes, { where: { rol: "estudiante" } });
        if (estudiantes.length !== listaEstudiantes.length) {
            return [null, "Uno o más estudiantes no encontrados"];
        }
        profesor.estudiantes = estudiantes;
        await userRepository.save(profesor);
        return [profesor, null];
    } catch (error) {
        console.error("Error al asignar estudiantes al profesor:", error);
        return [null, "Error interno del servidor"];
    }
}
