"use strict";
import evaluationService from "../services/evaluation.service.js";

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

export default {
    createEvaluation,
    listEvaluations,
    updateEvaluation,
};