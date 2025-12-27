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

const updateEvaluation = async (req, res) => {
    try {
        const profesorId = req.user.id;
        const { id } = req.params;
        const { nombre_pauta, items } = req.body;

    if (!nombre_pauta || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "nombre_pauta e items (array no vacío) son requeridos" });
    }

    const result = await evaluationService.updateEvaluation({
        profesorId,
        pautaId: id,
        nombre_pauta,
        items,
    });

    res.status(200).json(result);
    } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
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
    getStudentGradesController,
};