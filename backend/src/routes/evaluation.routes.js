"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validateRequest } from "../middlewares/evaluation.middleware.js";
import {
    createPautaValidation,
    evaluateStudentValidation,
    updatePautaValidation,
    updateStudentEvaluationValidation,
} from "../validations/evaluation.validation.js";

import {
    createEvaluationController,
    deleteEvaluationController,
    evaluateStudentController,
    getEvaluationByIdController,
    getStudentGradesController,
    listEvaluationsController,
    listProfessorReviewsController,
    listStudentsController,
    updateEvaluationController,
    updateStudentEvaluationController,
} from "../controllers/evaluation.controller.js";

const router = Router();

router.post(
    "/evaluations-create",
    authenticateJwt,
    authorize(["profesor"]),
    validateRequest(createPautaValidation),
    createEvaluationController
);

router.post(
    "/evaluate",
    authenticateJwt,
    authorize(["profesor"]),
    validateRequest(evaluateStudentValidation),
    evaluateStudentController
);

router.get(
    "/evaluations-list",
    authenticateJwt,
    authorize(["profesor"]),
    listEvaluationsController
);

router.get(
    "/reviews",
    authenticateJwt,
    authorize(["profesor"]),
    listProfessorReviewsController
);

router.get(
    "/students",
    authenticateJwt,
    authorize(["profesor"]),
    listStudentsController
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
    validateRequest(updatePautaValidation),
    updateEvaluationController
);

router.put(
    "/student-evaluation/:id",
    authenticateJwt,
    authorize(["profesor"]),
    validateRequest(updateStudentEvaluationValidation),
    updateStudentEvaluationController
);

router.get(
    "/:id",
    authenticateJwt,
    authorize(["profesor", "estudiante"]),
    getEvaluationByIdController
);

router.delete(
    "/:id",
    authenticateJwt,
    authorize(["profesor"]),
    deleteEvaluationController
);

export default router;
