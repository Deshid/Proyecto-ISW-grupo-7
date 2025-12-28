"use strict";
import evaluationService from "../services/evaluation.service.js";
import { handleErrorClient, handleSuccess } from "../handlers/responseHandlers.js";

const createEvaluation = async (req, res) => {
    try {
        const profesorId = req.user.id;
        const { nombre_pauta, items } = req.body;

    if (!nombre_pauta || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "nombre_pauta e items son requeridos" });
    }

    const result = await evaluationService.createEvaluation({
        profesorId,
        nombre_pauta,
        items,
    });

    res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};

const listEvaluations = async (req, res) => {
    try {
        const profesorId = req.user?.id;
        const list = await evaluationService.listEvaluations(profesorId);
        res.status(200).json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const updateEvaluation = async ({ profesorId, pautaId, nombre_pauta, items }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const itemRepo  = queryRunner.manager.getRepository("ItemPauta");
        const evalRepo  = queryRunner.manager.getRepository("EvaluacionEstudiante"); // <-- faltaba

        const pautaIdNum = Number(pautaId);

        const pauta = await pautaRepo.findOne({
            where: { id: pautaIdNum },
            relations: ["creador", "items"],
        });

        if (!pauta) throw new Error("Pauta no encontrada");
        if (pauta.creador.id !== profesorId) throw new Error("No autorizado: no eres el creador de esta pauta");

        const evaluacionesCount = await evalRepo.count({
            where: { pauta: { id: pautaIdNum } },
        });
        if (evaluacionesCount > 0) {
            throw new Error("No se puede modificar una pauta que ya tiene evaluaciones asociadas");
        }

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

        await itemRepo.delete({ pauta: { id: pautaIdNum } });

        const itemEntities = items.map((it) =>
            itemRepo.create({
                descripcion: it.descripcion,
                puntaje_maximo: it.puntaje_maximo,
                pauta: { id: pautaIdNum },
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

const getEvaluationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.rol; 
        const evaluation = await evaluationService.getEvaluationById(id, userId, userRole);
        res.status(200).json(evaluation);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};

export const evaluateStudentController = async (req, res) => {
    try {
        const { pautaId, estudianteId, puntajesItems, asiste = true, repeticion = false } = req.body;
        console.log("[evaluateStudentController] body flags:", { asiste, repeticion });
        const profesorId = req.user.id;
        
        const result = await evaluationService.evaluateStudent({
            profesorId,
            pautaId,
            estudianteId,
            puntajesItems,
            asiste,
            repeticion,
        });
        
        handleSuccess(res, 201, result.message, result.evaluacion);
    } catch (error) {
        console.error("[evaluateStudentController] error:", error);
        handleErrorClient(res, 400, error.message);
    }
};

export const updateStudentEvaluationController = async (req, res) => {
    try {
        const { id } = req.params; // ID de la evaluación
        const { puntajesItems } = req.body;
        const profesorId = req.user.id;

        const result = await evaluationService.updateStudentEvaluation({
            profesorId,
            evaluacionId: Number(id),
            puntajesItems,
        });

        handleSuccess(res, 200, result.message, result.evaluacion);
    } catch (error) {
        handleErrorClient(res, 400, error.message);
    }
};

export const getStudentGradesController = async (req, res) => {
    try {
        const paramId = req.params?.studentId;
        const studentId = Number.parseInt(String(paramId), 10);

        if (!Number.isFinite(studentId) || studentId <= 0) {
            return handleErrorClient(res, 400, "studentId debe ser un entero positivo");
        }

        const grades = await evaluationService.getStudentGrades(studentId);
        handleSuccess(res, 200, "Notas obtenidas", grades);
    } catch (error) {
        handleErrorClient(res, 400, error.message);
    }
};

export default {
    createEvaluation,
    listEvaluations,
    updateEvaluation,
    getEvaluationById,
    evaluateStudentController,
    updateStudentEvaluationController,
    getStudentGradesController,
};