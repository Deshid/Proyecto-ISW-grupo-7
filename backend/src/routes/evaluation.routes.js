"use strict";
import { Router } from "express";
import evaluationController from "../controllers/evaluation.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { evaluateStudentController, getStudentGradesController } from "../controllers/evaluation.controller.js";
import { updateStudentEvaluationController } from "../controllers/evaluation.controller.js";    

const router = Router();

router.post(
    "/evaluations-create",
    authenticateJwt,
    authorize(["profesor"]),
    evaluationController.createEvaluation
);

router.post(
    "/evaluate", 
    authenticateJwt, 
    authorize(["profesor"]),
    evaluateStudentController);

router.get(
    "/evaluations-list",
    authenticateJwt,
    authorize(["profesor"]),
    evaluationController.listEvaluations
);

router.get(
    "/grades/:studentId?",
    authenticateJwt,
    authorize(["profesor", "estudiante"]),
    getStudentGradesController);

router.put(
    "/:id",
    authenticateJwt,
    authorize(["profesor"]),
    evaluationController.updateEvaluation
);

router.put(
    "/student-evaluation/:id",
    authenticateJwt,
    authorize(["profesor"]),
    updateStudentEvaluationController
);

router.get(
    "/:id",
    authenticateJwt,
    authorize(["profesor", "estudiante"]),
    evaluationController.getEvaluationById
);

export default router;