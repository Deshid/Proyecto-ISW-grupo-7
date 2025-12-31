import { authenticateJwt } from "../middlewares/authentication.middleware.js";
"use strict";
import { Router } from "express";
import { SubjectController } from "../controllers/subject.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: API endpoints for managing subjects
 */

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
 *     responses:
 *       200:
 *         description: List of all subjects
 *       500:
 *         description: Internal server error
 */
router.get("/subject-list", SubjectController.getAllSubjects);

/**
 * @swagger
 * /api/subjects/search:
 *   get:
 *     summary: Search subjects by name
 *     tags: [Subjects]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name or part of name to search
 *     responses:
 *       200:
 *         description: Subjects matching search criteria
 *       400:
 *         description: Search term is required
 *       500:
 *         description: Internal server error
 */
router.get("/search", SubjectController.searchSubjects);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get a subject by ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject details
 *       400:
 *         description: Invalid subject ID
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", SubjectController.getSubjectById);

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Name of the subject
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
// Proteger la creación para capturar el usuario autenticado como creador
router.post("/subject-create", authenticateJwt, SubjectController.createSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update a subject
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Updated name of the subject
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", SubjectController.updateSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       400:
 *         description: Invalid subject ID
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", SubjectController.deleteSubject);

export default router;