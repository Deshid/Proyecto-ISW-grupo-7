"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { SubjectService } from "../services/subject.service.js";

export class SubjectController {
    // Obtener todas las materias
    static async getAllSubjects(req, res) {
        try {
            const result = await SubjectService.getAllSubjects();
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    message: result.message
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Obtener una materia por ID
    static async getSubjectById(req, res) {
        try {
            const { id } = req.params;
            const subjectId = parseInt(id);
            
            if (isNaN(subjectId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subject ID"
                });
            }
            
            const result = await SubjectService.getSubjectById(subjectId);
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    message: result.message
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Crear una nueva materia
    static async createSubject(req, res) {
        try {
            console.log("[DEBUG Controller] Body recibido:", req.body);
            console.log("[DEBUG Controller] Headers:", req.headers);
            
            const { nombre } = req.body;
            
            if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Subject name is required and must be a non-empty string"
                });
            }
            
            const result = await SubjectService.createSubject({ nombre });
            
            if (result.success) {
                return res.status(201).json({
                    success: true,
                    data: result.data,
                    message: result.message
                });
            } else {
                // Si el error es de metadata, el service lo habrá logueado
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    // Solo envía error en desarrollo
                    error: process.env.NODE_ENV === 'development' ? result.error : undefined
                });
            }
        } catch (error) {
            console.error("[ERROR Controller] Error inesperado:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Actualizar una materia existente
    static async updateSubject(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;
            const subjectId = parseInt(id);
            
            if (isNaN(subjectId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subject ID"
                });
            }
            
            // Validar que al menos un campo sea proporcionado
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "At least one field (nombre) must be provided for update"
                });
            }
            
            const result = await SubjectService.updateSubject(subjectId, { nombre });
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    message: result.message
                });
            } else {
                return res.status(result.message === "Subject not found" ? 404 : 400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Eliminar una materia
    static async deleteSubject(req, res) {
        try {
            const { id } = req.params;
            const subjectId = parseInt(id);
            
            if (isNaN(subjectId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subject ID"
                });
            }
            
            const result = await SubjectService.deleteSubject(subjectId);
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    // Buscar materias por nombre
    static async searchSubjects(req, res) {
        try {
            const { name } = req.query;
            
            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Search term is required"
                });
            }
            
            const result = await SubjectService.searchSubjectsByName(name);
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    message: result.message
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
}