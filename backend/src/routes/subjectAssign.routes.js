"use strict";
import { Router } from "express";
import { SubjectAssignController } from "../controllers/subjectAssign.controller.js";

const router = Router();

/**
 * Relación Usuario-Tema (Many-to-Many)
 */

// Asignar usuario a tema
router.post("/assign", SubjectAssignController.assignUserToSubject);

// Remover usuario de tema
router.delete("/remove", SubjectAssignController.removeUserFromSubject);

// Obtener usuarios asignados a un tema específico
router.get("/subject/:subjectId/users", SubjectAssignController.getUsersBySubject);

// Obtener temas asignados a un usuario específico
router.get("/user/:userId/subjects", SubjectAssignController.getSubjectsByUser);

export default router;