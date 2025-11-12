"use strict";
import { Router } from "express";
import evaluationController from "../controllers/evaluation.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";

const router = Router();

router.post(
    "/evaluations-create",
    authenticateJwt,
    authorize(["profesor"]),
    evaluationController.createEvaluation
);

router.get(
    "/evaluations-list",
    authenticateJwt,
    authorize(["profesor"]),
    evaluationController.listEvaluations
);
export default router;