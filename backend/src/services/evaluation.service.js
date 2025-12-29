"use strict";
import { AppDataSource } from "../config/configDb.js";
import { calculateGrade } from "../helpers/calculateGrade.helper.js";

const createEvaluation = async ({ profesorId, nombre_pauta, items }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const itemRepo = queryRunner.manager.getRepository("ItemPauta");

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("La pauta debe contener al menos un item");
    }
    for (const it of items) {
        if (!it.descripcion || it.puntaje_maximo === undefined) {
            throw new Error("Cada item debe tener 'descripcion' y 'puntaje_maximo'");
        }
        if (Number(it.puntaje_maximo) < 1) {
            throw new Error("puntaje_maximo no puede ser menor que 1");
        }
    }

    const pauta = pautaRepo.create({
        nombre_pauta,
        creador: { id: profesorId },
    });
    const savedPauta = await pautaRepo.save(pauta);

    const itemEntities = items.map((it) =>
        itemRepo.create({
            descripcion: it.descripcion,
            puntaje_maximo: it.puntaje_maximo,
            pauta: { id: savedPauta.id },
        })
    );
    const savedItems = await itemRepo.save(itemEntities);

    await queryRunner.commitTransaction();

    return { message: "Pauta creada exitosamente", pauta: savedPauta, items: savedItems };
    } catch (err) {
        await queryRunner.rollbackTransaction();
    throw err;
    } finally {
        await queryRunner.release();
    }
};

const listEvaluations = async (profesorId) => {
    const pautaRepo = AppDataSource.getRepository("Pauta");
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
    const where = profesorId ? { creador: { id: profesorId } } : {};
    const pautas = await pautaRepo.find({
        where,
        relations: ["items"],
    });
    
    // Contar evaluaciones por pauta
    const pautasConEvals = await Promise.all(
        pautas.map(async (pauta) => {
            const evalCount = await evalRepo.count({
                where: { pauta: { id: pauta.id } }
            });
            return {
                ...pauta,
                evaluacionesCount: evalCount,
                tieneEvaluaciones: evalCount > 0
            };
        })
    );
    
    return pautasConEvals;
}


const updateEvaluation = async ({ profesorId, pautaId, nombre_pauta, items }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const itemRepo = queryRunner.manager.getRepository("ItemPauta");

        // Ya no necesitas validar ownership ni conteo de evaluaciones (lo hace el middleware)
        const pauta = await pautaRepo.findOne({
        where: { id: pautaId },
        relations: ["creador"],
        });

        pauta.nombre_pauta = nombre_pauta;
        await pautaRepo.save(pauta);

        await itemRepo.delete({ pauta: { id: pautaId } });

        const itemEntities = items.map((it) =>
        itemRepo.create({
            descripcion: it.descripcion,
            puntaje_maximo: it.puntaje_maximo,
            pauta: { id: pautaId },
        })
        );
        const savedItems = await itemRepo.save(itemEntities);

        await queryRunner.commitTransaction();
        return { message: "Pauta actualizada exitosamente", pauta, items: savedItems };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};


const getEvaluationById = async (id, userId, userRole) => {
    const pautaRepo = AppDataSource.getRepository("Pauta");
    const numericId = Number(id);
    const pauta = await pautaRepo.findOne({
        where: { id: numericId },
        relations: ["creador", "items"],
    });

    if (!pauta) {
        const error = new Error("Pauta no encontrada");
        error.status = 404;
        throw error;
    }
    if (userRole === "profesor" && pauta.creador?.id !== userId) {
        const error = new Error("No autorizado: no eres el creador de esta pauta");
        error.status = 403;
        throw error;
    }

    return pauta;
};

const updateStudentEvaluation = async ({ profesorId, evaluacionId, puntajesItems }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const evalRepo = queryRunner.manager.getRepository("EvaluacionEstudiante");
        const detalleRepo = queryRunner.manager.getRepository("DetalleEvaluacion");

        const evaluacion = await evalRepo.findOne({
            where: { id: evaluacionId },
            relations: ["pauta", "pauta.creador", "pauta.items", "detalles"],
        });

        if (!evaluacion) throw new Error("Evaluación no encontrada");
        if (evaluacion.pauta.creador.id !== profesorId) throw new Error("No autorizado");
        if (!evaluacion.asiste) throw new Error("No se puede modificar una evaluación de ausencia");

        // Validar que se incluyan todos los items
        if (!Array.isArray(puntajesItems) || puntajesItems.length !== evaluacion.pauta.items.length) {
            throw new Error("Debe incluir puntajes para todos los items de la pauta");
        }

        // Recalcular puntaje total y nota
        let puntajeObtenido = 0;
        const puntajeMaximo = evaluacion.pauta.items.reduce((acc, it) => acc + Number(it.puntaje_maximo), 0);

        for (const item of evaluacion.pauta.items) {
            const pi = puntajesItems.find(p => p.itemId === item.id);
            if (!pi) throw new Error(`Falta puntaje para item ${item.id}`);
            if (Number(pi.puntaje) > Number(item.puntaje_maximo)) {
                throw new Error(`Puntaje ${pi.puntaje} excede el máximo ${item.puntaje_maximo} para item ${item.id}`);
            }
            puntajeObtenido += Number(pi.puntaje);
        }

        const nuevaNota = calculateGrade(puntajeObtenido, puntajeMaximo, evaluacion.pauta.porcentaje_escala);

        // Actualizar evaluación
        evaluacion.puntaje_obtenido = puntajeObtenido;
        evaluacion.nota = nuevaNota;
        evaluacion.fecha_edicion = new Date();
        await evalRepo.save(evaluacion);

        // Eliminar detalles antiguos con query builder (evita problemas de criterio en relaciones)
        await detalleRepo.createQueryBuilder()
        .delete()
        .from("DetalleEvaluacion")
        .where("id_evaluacion = :id", { id: evaluacionId })
        .execute();

        // Crear nuevos detalles
        const nuevosDetalles = puntajesItems.map((pi) =>
        detalleRepo.create({
            evaluacion: { id: evaluacionId },
            item: { id: pi.itemId },
            puntaje_obtenido: Number(pi.puntaje),
            comentario: pi.comentario || null,
        })
        );

        await detalleRepo.save(nuevosDetalles);

        // Recargar evaluación con relaciones para devolver “detalles” actualizados
        const evaluacionActualizada = await evalRepo.findOne({
        where: { id: evaluacionId },
        relations: ["pauta", "pauta.creador", "pauta.items", "estudiante", "detalles", "detalles.item"],
        });

        await queryRunner.commitTransaction();

        return { message: "Evaluación actualizada exitosamente", evaluacion: evaluacionActualizada };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};

const evaluateStudent = async ({ profesorId, 
    pautaId, 
    estudianteId, 
    puntajesItems, 
    asiste: _asiste = true, 
    repeticion: _repeticion = false }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const evalRepo = queryRunner.manager.getRepository("EvaluacionEstudiante");
        const detalleRepo = queryRunner.manager.getRepository("DetalleEvaluacion");

        const pauta = await pautaRepo.findOne({
            where: { id: pautaId },
            relations: ["creador", "items"],
        });

        if (!pauta) throw new Error("Pauta no encontrada");
        if (pauta.creador.id !== profesorId) throw new Error("No autorizado");

        const previa = await evalRepo.findOne({
        where: { estudiante: 
                    { id: estudianteId }, 
                pauta: 
                    { id: pautaId } 
                },
        });
        if (_repeticion && !previa) throw new Error("La repetición solo se permite si existe una evaluación previa");

        // Coercer a booleanos para evitar referencias inesperadas
        console.log("[evaluateStudent] raw flags:", { _asiste, _repeticion });
        const attended = Boolean(_asiste);
        const repeated = Boolean(_repeticion);

        let puntajeObtenido = 0;
        let puntajeMaximo = pauta.items.reduce((acc, it) => acc + Number(it.puntaje_maximo), 0);
        let nota = 1;

        if (attended) {
            for (const item of pauta.items) {
                const puntajeItem = puntajesItems?.find(p => p.itemId === item.id);
                if (!puntajeItem) {
                    const expectedIds = pauta.items.map(it => it.id);
                    const mensaje = `Falta puntaje para item ${item.id}. `
                                  + `Asegúrate de usar los IDs reales de la pauta: ${expectedIds.join(", ")}`;
                    throw new Error(mensaje);
                }
                puntajeObtenido += Number(puntajeItem.puntaje);
            }
            nota = calculateGrade(puntajeObtenido, puntajeMaximo, pauta.porcentaje_escala);
        } else {
            puntajeObtenido = 0;
            nota = 1;
        }

        const evaluacion = evalRepo.create({
            estudiante: { id: estudianteId },
            pauta: { id: pautaId },
            puntaje_obtenido: puntajeObtenido,
            nota,
            asiste: attended,
            repeticion: repeated,
        });

        const savedEval = await evalRepo.save(evaluacion);
        
        if (attended && Array.isArray(puntajesItems) && puntajesItems.length > 0) {
            const detalles = puntajesItems.map(pi =>
                detalleRepo.create({
                    evaluacion: { id: savedEval.id },
                    item: { id: pi.itemId },
                    puntaje_obtenido: Number(pi.puntaje),
                    comentario: pi.comentario || null,
                })
            );

            await detalleRepo.save(detalles);
        }

        await queryRunner.commitTransaction();

        return { message: "Estudiante evaluado exitosamente", evaluacion: savedEval };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};

const getStudentGrades = async (estudianteId) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
    const userRepo = AppDataSource.getRepository("User");
    
    const estudiante = await userRepo.findOne({ where: { id: estudianteId } });
    if (!estudiante) throw new Error("Estudiante no encontrado");
    
    return await evalRepo.find({
        where: { estudiante: { id: estudianteId } },
        relations: ["pauta", "estudiante", "detalles", "detalles.item"],
    });
};

// Listar evaluaciones realizadas sobre pautas del profesor
const listProfessorReviews = async (profesorId) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
    return await evalRepo.find({
        where: { pauta: { creador: { id: profesorId } } },
        relations: ["pauta", "pauta.creador", "estudiante", "detalles", "detalles.item"],
        order: { fecha_evaluacion: "DESC" },
    });
};

const deleteEvaluation = async (pautaId, profesorId) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const evalRepo = queryRunner.manager.getRepository("EvaluacionEstudiante");
        
        const pauta = await pautaRepo.findOne({
            where: { id: pautaId },
            // No dependemos de una relación "evaluaciones" aquí; validamos con un conteo aparte
            relations: ["creador"],
        });

        if (!pauta) {
            const error = new Error("Pauta no encontrada");
            error.status = 404;
            throw error;
        }

        if (pauta.creador.id !== profesorId) {
            const error = new Error("No autorizado: no eres el creador de esta pauta");
            error.status = 403;
            throw error;
        }

        // Verificar si hay evaluaciones asociadas
        const evaluacionesCount = await evalRepo.count({
            where: { pauta: { id: pautaId } }
        });

        if (evaluacionesCount > 0) {
            const error = new Error(`No se puede eliminar una pauta que tiene ${evaluacionesCount}`
                + " evaluación(es) asociada(s)");
            error.status = 400;
            throw error;
        }

        // Eliminar primero los items de la pauta para evitar violación de FK
        const itemRepo = queryRunner.manager.getRepository("ItemPauta");
        await itemRepo.delete({ pauta: { id: pautaId } });

        // Luego eliminar la pauta
        await pautaRepo.remove(pauta);
        await queryRunner.commitTransaction();

        return { message: "Pauta eliminada exitosamente" };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};

// Listar estudiantes (usuarios con rol "estudiante")
const listStudents = async () => {
    const userRepo = AppDataSource.getRepository("User");
    return await userRepo.find({
        where: { rol: "estudiante" },
        select: ["id", "nombreCompleto", "email", "rut"],
    });
};

export default {
    createEvaluation,
    listEvaluations,
    updateEvaluation,
    getEvaluationById,    
    evaluateStudent,
    updateStudentEvaluation,
    getStudentGrades,
    listProfessorReviews,
    listStudents,
    deleteEvaluation,
};