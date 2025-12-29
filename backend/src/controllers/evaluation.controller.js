"use strict";
import evaluationService from "../services/evaluation.service.js";
import { handleErrorClient, handleSuccess } from "../handlers/responseHandlers.js";

export const createEvaluationController = async (req, res) => {
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

export const listEvaluationsController = async (req, res) => {
    try {
        const profesorId = req.user?.id;
        const list = await evaluationService.listEvaluations(profesorId);
        res.status(200).json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

    export const listPautasPaginatedController = async (req, res) => {
        try {
            const profesorId = req.user?.id;
            const { hasEvaluations, search, page, limit, sortBy, order } = req.query;

            const hasEvalsFlag = hasEvaluations === undefined
                ? undefined
                : hasEvaluations === "true" ? true : hasEvaluations === "false" ? false : undefined;

            const result = await evaluationService.listPautasPaginated(profesorId, {
                hasEvaluations: hasEvalsFlag,
                search,
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                sortBy: sortBy || "fecha_modificacion",
                order: (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC",
            });

            const data = {
                items: result.data,
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            };
            handleSuccess(res, 200, result.message, data);
        } catch (error) {
            handleErrorClient(res, 400, error.message);
        }
    };

export const listProfessorReviewsController = async (req, res) => {
    try {
        const profesorId = req.user.id;
        const reviews = await evaluationService.listProfessorReviews(profesorId);
        handleSuccess(res, 200, "Evaluaciones listadas", reviews);
    } catch (error) {
        handleErrorClient(res, 400, error.message);
    }
};

    export const listProfessorReviewsGroupedController = async (req, res) => {
        try {
            const profesorId = req.user.id;
            const { searchPauta, searchStudent, page, limit, order } = req.query;

            const result = await evaluationService.listProfessorReviewsGrouped(profesorId, {
                searchPauta,
                searchStudent,
                page: Number(page) || 1,
                limit: Number(limit) || 5,
                order: (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC",
            });

            const data = {
                groups: result.data,
                page: result.page,
                limit: result.limit,
                totalGroups: result.totalGroups,
                totalPages: result.totalPages,
            };
            handleSuccess(res, 200, result.message, data);
        } catch (error) {
            handleErrorClient(res, 400, error.message);
        }
    };

export const listStudentsController = async (req, res) => {
    try {
        const students = await evaluationService.listStudents();
        handleSuccess(res, 200, "Estudiantes listados", students);
    } catch (error) {
        console.error("[listStudentsController] error:", error);
        handleErrorClient(res, 400, error.message);
    }
};

export const listAssignedStudentsController = async (req, res) => {
    try {
        const profesorId = req.user.id;
        const students = await evaluationService.listAssignedStudents(profesorId);
        handleSuccess(res, 200, "Estudiantes asignados listados", students);
    } catch (error) {
        console.error("[listAssignedStudentsController] error:", error);
        handleErrorClient(res, 400, error.message);
    }
};

export const updateEvaluationController = async (req, res) => {
    try {
        const profesorId = req.user.id;
        const pautaId = Number(req.params.id);
        const { nombre_pauta, items } = req.body;

        const result = await evaluationService.updateEvaluation({
            profesorId,
            pautaId,
            nombre_pauta,
            items,
    });

        handleSuccess(res, 200, result.message, { pauta: result.pauta, items: result.items });
    } catch (error) {
        handleErrorClient(res, 400, error.message);
    }
};

export const getEvaluationByIdController = async (req, res) => {
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

export const deleteEvaluationController = async (req, res) => {
    try {
        const profesorId = req.user.id;
        const pautaId = Number(req.params.id);

        const result = await evaluationService.deleteEvaluation(pautaId, profesorId);
        handleSuccess(res, 200, result.message);
    } catch (error) {
        handleErrorClient(res, error.status || 400, error.message);
    }
};

export default {
    createEvaluationController,    
    evaluateStudentController,
    getEvaluationByIdController,
    getStudentGradesController,
    listEvaluationsController,
    listPautasPaginatedController,
    listProfessorReviewsController,
    listProfessorReviewsGroupedController,
    listStudentsController,
    listAssignedStudentsController,
    updateEvaluationController,
    updateStudentEvaluationController,
    deleteEvaluationController,
};