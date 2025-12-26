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

/**
 * @swagger
 * /api/relations/user/{userId}/all:
 *   delete:
 *     summary: Remove all subjects from a user
 *     tags: [Relations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: All subjects removed successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/user/:userId/remove-all", SubjectAssignController.removeAllSubjectsFromUser);

/**
 * @swagger
 * /api/subjectAssign/clean-orphans:
 *   delete:
 *     summary: Clean orphan relations
 *     tags: [SubjectAssign]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 */
router.delete("/clean-orphans", SubjectAssignController.cleanOrphanRelations);

export default router;