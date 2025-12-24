"use strict";
import { SubjectAssignService } from "../services/subjectAssign.service.js";

export class SubjectAssignController {
    // POST: Asignar usuario a tema
    static async assignUserToSubject(req, res) {
        try {
            const { userId, subjectId } = req.body;
            
            if (!userId || !subjectId) {
                return res.status(400).json({
                    success: false,
                    message: "Se requieren userId y subjectId"
                });
            }
            
            const result = await SubjectAssignService.assignUserToSubject(
                parseInt(userId),
                parseInt(subjectId)
            );
            
            const status = result.success ? 200 : 400;
            return res.status(status).json(result);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error.message
            });
        }
    }
    
    // DELETE: Remover usuario de tema
    static async removeUserFromSubject(req, res) {
        try {
            const { userId, subjectId } = req.body;
            
            if (!userId || !subjectId) {
                return res.status(400).json({
                    success: false,
                    message: "Se requieren userId y subjectId"
                });
            }
            
            const result = await SubjectAssignService.removeUserFromSubject(
                parseInt(userId),
                parseInt(subjectId)
            );
            
            const status = result.success ? 200 : 404;
            return res.status(status).json(result);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error.message
            });
        }
    }
    
    // GET: Usuarios por tema
    static async getUsersBySubject(req, res) {
        try {
            const { subjectId } = req.params;
            
            if (!subjectId) {
                return res.status(400).json({
                    success: false,
                    message: "Se requiere subjectId"
                });
            }
            
            const result = await SubjectAssignService.getUsersBySubject(
                parseInt(subjectId)
            );
            
            const status = result.success ? 200 : 404;
            return res.status(status).json(result);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error.message
            });
        }
    }
    
    // GET: Temas por usuario
    static async getSubjectsByUser(req, res) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "Se requiere userId"
                });
            }
            
            const result = await SubjectAssignService.getSubjectsByUser(
                parseInt(userId)
            );
            
            const status = result.success ? 200 : 404;
            return res.status(status).json(result);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error.message
            });
        }
    }
}