"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { ProfessorCreatedSubjectService } from "../services/professorCreatedSubject.service.js";

export class ProfessorCreatedSubjectController {
  static async getAll(req, res) {
    try {
      const result = await ProfessorCreatedSubjectService.getAll();
      return res.status(200).json(result);
    } catch (error) {
      return handleErrorServer(res, 500, "Internal server error");
    }
  }

  static async getByProfessor(req, res) {
    try {
      const { professorId } = req.params;
      const result = await ProfessorCreatedSubjectService.getByProfessor(professorId);
      return res.status(200).json(result);
    } catch (error) {
      return handleErrorServer(res, 500, "Internal server error");
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorCreatedSubjectService.getById(id);
      if (!result.success) return handleErrorClient(res, 404, result.message);
      return res.status(200).json(result);
    } catch (error) {
      return handleErrorServer(res, 500, "Internal server error");
    }
  }

  static async create(req, res) {
    try {
      const { professorId, subjectId } = req.body;
      // Allow server to enforce professorId = req.user.id when authenticated
      const effectiveProfessorId = req.user && req.user.id ? req.user.id : professorId;
      const result = await ProfessorCreatedSubjectService.createRelation({ professorId: effectiveProfessorId, subjectId });
      if (!result.success) return handleErrorClient(res, 400, result.message);
      return res.status(201).json(result);
    } catch (error) {
      return handleErrorServer(res, 500, "Internal server error");
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorCreatedSubjectService.deleteRelation(id);
      if (!result.success) return handleErrorClient(res, 404, result.message);
      return handleSuccess(res, 200, result.message);
    } catch (error) {
      return handleErrorServer(res, 500, "Internal server error");
    }
  }
}
