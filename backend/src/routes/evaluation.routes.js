"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import {
    createEvaluationController,
    evaluateStudentController,
    getEvaluationByIdController,
    getStudentGradesController,
    listEvaluationsController,
    updateEvaluationController,
    updateStudentEvaluationController,
    
} from "../controllers/evaluation.controller.js";

const router = Router();

router.post(
    "/evaluations-create",
    authenticateJwt,
    authorize(["profesor"]),
    createEvaluationController
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
    listEvaluationsController
);

router.get(
    "/grades/:studentId?",
    authenticateJwt,
    authorize(["profesor", "estudiante"]),
    getStudentGradesController
);

router.put(
    "/:id",
    authenticateJwt,
    authorize(["profesor"]),
    updateEvaluationController
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
    getEvaluationByIdController
);

export default router;