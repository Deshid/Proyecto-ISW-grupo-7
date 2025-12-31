import { authenticateJwt } from "../middlewares/authentication.middleware.js";
"use strict";
import { Router } from "express";
import { ProfessorCreatedSubjectController } from "../controllers/professorCreatedSubject.controller.js";

const router = Router();

// Obtener todas las relaciones
router.get("/", ProfessorCreatedSubjectController.getAll);

// Obtener por profesor
router.get("/professor/:professorId", ProfessorCreatedSubjectController.getByProfessor);

// Obtener por id
router.get("/:id", ProfessorCreatedSubjectController.getById);

// Crear (protegido) - si está autenticado se usará req.user.id
router.post("/", authenticateJwt, ProfessorCreatedSubjectController.create);

// Borrar (protegido)
router.delete("/:id", authenticateJwt, ProfessorCreatedSubjectController.delete);

export default router;
