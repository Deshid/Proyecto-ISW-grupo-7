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
    const where = profesorId ? { creador: { id: profesorId } } : {};
    const pautas = await pautaRepo.find({
        where,
        relations: ["items"],
    });
    return pautas;
}

const updateEvaluation = async ({ profesorId, pautaId, nombre_pauta, items }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const itemRepo = queryRunner.manager.getRepository("ItemPauta");

    const pauta = await pautaRepo.findOne({ 
        where: { id: pautaId }, 
        relations: ["creador", "items"] 
    });

    if (!pauta) throw new Error("Pauta no encontrada");
    if (pauta.creador.id !== profesorId) throw new Error("No autorizado: no eres el creador de esta pauta");

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


const evaluateStudent = async ({ profesorId, pautaId, estudianteId, puntajesItems }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const evalRepo = queryRunner.manager.getRepository("EvaluacionEstudiante");

        const pauta = await pautaRepo.findOne({
            where: { id: pautaId },
            relations: ["creador", "items"],
        });

        if (!pauta) throw new Error("Pauta no encontrada");
        if (pauta.creador.id !== profesorId) throw new Error("No autorizado");

            // Validar repetición: solo si existe una previa en la misma pauta
        const previa = await evalRepo.findOne({
        where: { estudiante: 
                    { id: estudianteId }, 
                pauta: 
                    { id: pautaId } 
                },
        });
        if (repeticion && !previa) throw new Error("La repetición solo se permite si existe una evaluación previa");

        // Calcular puntaje total obtenido y máximo
        let puntajeObtenido = 0;
        let puntajeMaximo = pauta.items.reduce((acc, it) => acc + Number(it.puntaje_maximo), 0);

        if (asiste) {
            for (const item of pauta.items) {
                const puntajeItem = puntajesItems?.find(p => p.itemId === item.id);
                if (!puntajeItem) throw new Error(`Falta puntaje para item ${item.id}`);
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
            asiste,
            repeticion: repeticion,
        });

        const savedEval = await evalRepo.save(evaluacion);
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
        relations: ["pauta", "estudiante"],
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

        const evaluacionesCount = await evalRepo.count({
            where: { pauta: { id: pautaId } }
        });

        if (evaluacionesCount > 0) {
            const error = new Error(`No se puede eliminar una pauta que tiene ${evaluacionesCount}`
                + " evaluación(es) asociada(s)");
            error.status = 400;
            throw error;
        }

        const itemRepo = queryRunner.manager.getRepository("ItemPauta");
        await itemRepo.delete({ pauta: { id: pautaId } });

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

const listStudents = async () => {
    const userRepo = AppDataSource.getRepository("User");
    return await userRepo.find({
        where: { rol: "estudiante" },
        select: ["id", "nombreCompleto", "email", "rut"],
    });
};

const listAssignedStudents = async (profesorId) => {
    const userRepo = AppDataSource.getRepository("User");
    const profesor = await userRepo.findOne({
        where: { id: profesorId, rol: "profesor" },
        relations: ["estudiantes"],
    });

    // Si no existe el profesor o no tiene estudiantes vinculados, devolvemos todos los estudiantes
    if (!profesor || !Array.isArray(profesor.estudiantes) || profesor.estudiantes.length === 0) {
        return await userRepo.find({
            where: { rol: "estudiante" },
            select: ["id", "nombreCompleto", "email", "rut"],
        });
    }

    return profesor.estudiantes.map((estudiante) => ({
        id: estudiante.id,
        nombreCompleto: estudiante.nombreCompleto,
        email: estudiante.email,
        rut: estudiante.rut,
    }));
};

export default {
    createEvaluation,
    listEvaluations,
    updateEvaluation,
    getEvaluationById,    
    evaluateStudent,
    getStudentGrades,
};