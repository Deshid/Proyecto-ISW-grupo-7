"use strict";
import Lugar from "../entity/lugar.entity.js";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";

/* Crear horario */
export async function createHorarioService(id_lugar, fecha, horaInicio, horaFin, modalidad) {
    try {
        const lugarRepository = AppDataSource.getRepository(Lugar);
        const lugar = await lugarRepository.findOneBy({ id_lugar: id_lugar });
        if (!lugar) {
            return [null, "Lugar no encontrado"];
        }
        
        // Convertir fecha a string ISO si viene como Date para evitar problemas de zona horaria
        const fechaStr = fecha instanceof Date ? fecha.toISOString().split("T")[0] : fecha;
        
        const horarioRepository = AppDataSource.getRepository("Horario");
        
        // Validar que no exista horario duplicado
        const horarioDuplicado = await horarioRepository.findOne({
            where: {
                lugar: { id_lugar: id_lugar },
                fecha: fechaStr,
                horaInicio: horaInicio,
                horaFin: horaFin,
            },
        });
        
        if (horarioDuplicado) {
            return [null, "Ya existe un horario con el mismo lugar, fecha y horas"];
        }
        
        const nuevoHorario = horarioRepository.create({
            lugar: lugar,
            fecha: fechaStr,
            horaInicio: horaInicio,
            horaFin: horaFin,
            modalidad: modalidad || null,
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
            where: { 
                lugar: { id_lugar: id_lugar },
                estado: "activo"
            },
            relations: ["lugar"],
            order: {
                fecha: "ASC",
                horaInicio: "ASC"
            }
        });
        return horarios;
    }
    catch (error) {
        console.error("Error al obtener horarios:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Actualizar horario */
export async function actualizarHorarioService(id_horario, fecha, horaInicio, horaFin, modalidad) {
    try {
        const horarioRepository = AppDataSource.getRepository("Horario");
        const horario = await horarioRepository.findOneBy({ id_horario: id_horario });
        if (!horario) {
            return [null, "Horario no encontrado"];
        }
        if (horario.estado === "finalizado") {
            return [null, "No se puede actualizar un horario finalizado"];
        }
        // Arreglo para evitar problemas de zona horaria
        const fechaStr = fecha instanceof Date ? fecha.toISOString().split("T")[0] : fecha;
        horario.fecha = fechaStr;
        horario.horaInicio = horaInicio;
        horario.horaFin = horaFin;
        if (modalidad !== undefined) {
            horario.modalidad = modalidad;
        }
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
        const userRepository = AppDataSource.getRepository(User);
        
        const horario = await horarioRepository.findOne({
            where: { id_horario: id_horario },
            relations: ["profesor"]
        });
        
        if (!horario) {
            return [null, "Horario no encontrado"];
        }
        if (horario.estado === "finalizado") {
            return [null, "No se puede eliminar un horario finalizado"];
        }
        
        // Si hay un profesor asignado, desasignar los estudiantes
        if (horario.profesor) {
            const profesor = await userRepository.findOne({
                where: { id: horario.profesor.id },
                relations: ["estudiantes"]
            });
            
            if (profesor) {
                profesor.estudiantes = [];
                await userRepository.save(profesor);
                console.log(`Estudiantes desasignados del profesor ${profesor.id} al eliminar horario ${id_horario}`);
            }
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
        if (horario.estado === "finalizado") {
            return [null, "No se puede asignar profesor a un horario finalizado"];
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
            relations: ["lugar", "profesor", "estudiantes"],
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
        
        // Usar QueryBuilder para cargar el profesor con sus relaciones
        const profesor = await userRepository
            .createQueryBuilder("profesor")
            .leftJoinAndSelect("profesor.estudiantes", "estudiante")
            .where("profesor.id = :id", { id: id_profesor })
            .andWhere("profesor.rol = :rol", { rol: "profesor" })
            .getOne();
        
        if (!profesor) {
            return [null, "Profesor no encontrado"];
        }
        
        const estudiantes = await userRepository.findByIds(listaEstudiantes, { where: { rol: "estudiante" } });
        
        if (estudiantes.length !== listaEstudiantes.length) {
            return [null, "Uno o más estudiantes no encontrados"];
        }
        
        // Verifica si algún estudiante ya tiene un profesor asignado
        const profesoresRepository = AppDataSource.getRepository(User);
        const profesoresConEstudiantes = await profesoresRepository
            .createQueryBuilder("profesor")
            .leftJoinAndSelect("profesor.estudiantes", "estudiante")
            .where("profesor.rol = :rol", { rol: "profesor" })
            .getMany();
        
        const estudiantesYaAsignados = [];
        for (const est of estudiantes) {
            for (const prof of profesoresConEstudiantes) {
                if (prof.estudiantes && prof.estudiantes.some(e => e.id === est.id)) {
                    // Si el profesor actual ya tiene este estudiante, no es error
                    if (prof.id !== id_profesor) {
                        estudiantesYaAsignados.push({
                            nombre: est.nombreCompleto,
                            profesor: prof.nombreCompleto
                        });
                    }
                }
            }
        }
        
        if (estudiantesYaAsignados.length > 0) {
            const mensajes = estudiantesYaAsignados.map(e => 
                `${e.nombre} ya está asignado a ${e.profesor}`
            ).join(", ");
            return [null, `Los siguientes estudiantes ya tienen profesor asignado: ${mensajes}`];
        }
        
        profesor.estudiantes = estudiantes;
        const profesorGuardado = await userRepository.save(profesor);
        
        return [profesorGuardado, null];
    } catch (error) {
        console.error("Error al asignar estudiantes al profesor:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Obtener estudiantes por profesor */
export async function getEstudiantesPorProfesorService(id_profesor) {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const profesor = await userRepository.findOne({
            where: { id: id_profesor, rol: "profesor" },
            relations: ["estudiantes"],
        });
        if (!profesor) {
            return [null, "Profesor no encontrado"];
        }
        return [profesor.estudiantes, null];
    } catch (error) {
        console.error("Error al obtener estudiantes por profesor:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Finalizar horario manualmente y desasignar estudiantes */
export async function finalizarHorarioService(id_horario) {
    try {
        const horarioRepository = AppDataSource.getRepository("Horario");
        const horario = await horarioRepository.findOne({
            where: { id_horario: id_horario },
            relations: ["profesor", "estudiantes"]
        });
        
        if (!horario) {
            return [null, "Horario no encontrado"];
        }
        
        if (horario.estado === "finalizado") {
            return [null, "El horario ya está finalizado"];
        }
        
        // Guardar estudiantes en el horario antes de desasignarlos del profesor
        if (horario.profesor) {
            const userRepository = AppDataSource.getRepository(User);
            const profesor = await userRepository
                .createQueryBuilder("profesor")
                .leftJoinAndSelect("profesor.estudiantes", "estudiantes")
                .where("profesor.id = :id", { id: horario.profesor.id })
                .getOne();
            
            if (profesor && profesor.estudiantes && profesor.estudiantes.length > 0) {
                // Copiar estudiantes al horario
                horario.estudiantes = profesor.estudiantes;
                await horarioRepository.save(horario);
                
                // Desasignar estudiantes del profesor
                profesor.estudiantes = [];
                await userRepository.save(profesor);
                
                // console.log(`Horario ${id_horario} finalizado. ${horario.estudiantes.length} estudiantes guardados en el registro.`);
            }
        }
        
        // Marcar como finalizado
        horario.estado = "finalizado";
        await horarioRepository.save(horario);
        
        return [{ horario, estudiantesLiberados: true }, null];
    } catch (error) {
        console.error("Error al finalizar horario:", error);
        return [null, error.message || "Error interno del servidor"];
    }
}

export async function getProfesoresConEstudiantesService() {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const profesores = await userRepository
            .createQueryBuilder("profesor")
            .leftJoinAndSelect("profesor.estudiantes", "estudiante")
            .where("profesor.rol = :rol", { rol: "profesor" })
            .orderBy("profesor.nombreCompleto", "ASC")
            .getMany();
        
        // Transformar la respuesta para que sea más clara
        const profesoresFormateados = profesores.map(prof => ({
            ...prof,
            estudiantesAsignados: prof.estudiantes || []
        }));
        
        return [profesoresFormateados, null];
    } catch (error) {
        console.error("Error al obtener profesores con estudiantes:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Finalizar horarios automáticamente */
export async function finalizarHorariosVencidos() {
    try {
        const horarioRepository = AppDataSource.getRepository("Horario");
        const ahora = new Date();
        const fechaHoy = ahora.toISOString().split("T")[0];
        const horaActual = ahora.toTimeString().split(" ")[0].substring(0, 5);

        // Buscar todos los horarios activos que ya pasaron, con relación profesor y estudiantes
        const horariosVencidos = await horarioRepository
            .createQueryBuilder("horario")
            .leftJoinAndSelect("horario.profesor", "profesor")
            .leftJoinAndSelect("horario.estudiantes", "estudiantes")
            .where("horario.estado = :estado", { estado: "activo" })
            .andWhere(
                "(horario.fecha < :fechaHoy OR (horario.fecha = :fechaHoy AND horario.horaFin <= :horaActual))",
                { fechaHoy, horaActual }
            )
            .getMany();

        // Actualizar estado a finalizado y desasignar estudiantes
        for (const horario of horariosVencidos) {
            // Desasignar estudiantes del profesor asignado a este horario
            if (horario.profesor) {
                const userRepository = AppDataSource.getRepository(User);
                const profesor = await userRepository
                    .createQueryBuilder("profesor")
                    .leftJoinAndSelect("profesor.estudiantes", "estudiantes")
                    .where("profesor.id = :id", { id: horario.profesor.id })
                    .getOne();
                
                if (profesor && profesor.estudiantes && profesor.estudiantes.length > 0) {
                    // Copiar estudiantes al horario
                    horario.estudiantes = profesor.estudiantes;
                    
                    // Desasignar estudiantes del profesor
                    profesor.estudiantes = [];
                    await userRepository.save(profesor);
                    // console.log(`  -> Estudiantes liberados del profesor ${profesor.nombreCompleto} y guardados en horario ${horario.id_horario}`);
                }
            }
            
            // Marcar como finalizado
            horario.estado = "finalizado";
            await horarioRepository.save(horario);
        }

        console.log(`* => ${horariosVencidos.length} horarios finalizados automáticamente`);
        return horariosVencidos.length;
    } catch (error) {
        console.error("Error al finalizar horarios vencidos:", error);
        return 0;
    }
}

/* Obtener horarios (comisiones) asignados a un estudiante */
export async function getHorariosPorEstudianteService(id_estudiante) {
    try {
        const userRepository = AppDataSource.getRepository("User");
        
        // buscar estudiante y profesor asignado
        const estudiante = await userRepository.findOne({
            where: { 
                id: id_estudiante, 
                rol: "estudiante"
            },
            relations: ["estudiantes"] // IMPORTANTE: Nombre de la relación INVERSA
        });

        if (!estudiante) {
            return [null, "Estudiante no encontrado"];
        }

        // encontrar profe del estudiante
        const profesorRepository = AppDataSource.getRepository("User");
        const profesor = await profesorRepository
            .createQueryBuilder("profesor")
            .innerJoin("profesor.estudiantes", "estudiante", "estudiante.id = :idEstudiante", { 
                idEstudiante: id_estudiante 
            })
            .where("profesor.rol = :rol", { rol: "profesor" })
            .getOne();

        if (!profesor) {
            return [null, "El estudiante no tiene un profesor asignado"];
        }

        // obtener horarios donde ese profesor esté asignado
        const horarioRepository = AppDataSource.getRepository("Horario");
        const horarios = await horarioRepository.find({
            where: { 
                profesor: { id: profesor.id },
                estado: "activo" // Solo horarios activos
            },
            relations: ["lugar", "profesor"], // Traer datos del lugar y profesor
            order: { 
                fecha: "ASC", 
                horaInicio: "ASC" 
            }
        });

        // frmatear respuesta 
        const comisionesFormateadas = horarios.map(horario => ({
            id_horario: horario.id_horario,
            lugar_evaluacion: horario.lugar?.nombre || "Sin lugar",
            ubicacion: horario.lugar?.ubicacion || "Sin ubicación",
            fecha: horario.fecha,
            hora_inicio: horario.horaInicio,
            hora_fin: horario.horaFin,
            estado: horario.estado,
            profesor_asignado: {
                id: profesor.id,
                nombre: profesor.nombreCompleto
            }
        }));

        return [comisionesFormateadas, null];

    } catch (error) {
        console.error(`Error obteniendo horarios para estudiante ${id_estudiante}:`, error);
        return [null, "Error interno del servidor al obtener comisiones"];
    }
}