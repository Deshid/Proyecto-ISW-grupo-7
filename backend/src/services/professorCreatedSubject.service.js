"use strict";
import { AppDataSource } from "../config/configDb.js";
import ProfessorCreatedSubjectSchema from "../entity/professorCreatedSubject.entity.js";

const ProfessorCreatedSubjectRepository = AppDataSource.getRepository(ProfessorCreatedSubjectSchema);

export class ProfessorCreatedSubjectService {
  static async getAll() {
    try {
      const items = await ProfessorCreatedSubjectRepository.find();
      return { success: true, data: items, message: "Relations retrieved successfully" };
    } catch (error) {
      console.error("Error fetching professor-created relations:", error);
      return { success: false, message: "Error fetching relations", error: error.message };
    }
  }

  static async getByProfessor(professorId) {
    try {
      const items = await ProfessorCreatedSubjectRepository.find({ where: { professorId: parseInt(professorId) } });
      return { success: true, data: items, message: "Relations retrieved successfully" };
    } catch (error) {
      console.error("Error fetching relations by professor:", error);
      return { success: false, message: "Error fetching relations", error: error.message };
    }
  }

  static async getById(id) {
    try {
      const item = await ProfessorCreatedSubjectRepository.findOne({ where: { id: parseInt(id) } });
      if (!item) return { success: false, message: "Relation not found" };
      return { success: true, data: item, message: "Relation retrieved successfully" };
    } catch (error) {
      console.error("Error fetching relation by id:", error);
      return { success: false, message: "Error fetching relation", error: error.message };
    }
  }

  static async createRelation(data) {
    try {
      const { professorId, subjectId } = data;
      if (!professorId || !subjectId) {
        return { success: false, message: "professorId and subjectId are required" };
      }
      const newItem = ProfessorCreatedSubjectRepository.create({
        professorId: parseInt(professorId),
        subjectId: parseInt(subjectId),
      });
      const saved = await ProfessorCreatedSubjectRepository.save(newItem);
      return { success: true, data: saved, message: "Relation created successfully" };
    } catch (error) {
      console.error("Error creating relation:", error);
      return { success: false, message: "Error creating relation", error: error.message };
    }
  }

  static async deleteRelation(id) {
    try {
      const result = await ProfessorCreatedSubjectRepository.delete(parseInt(id));
      if (result.affected === 0) return { success: false, message: "Relation not found" };
      return { success: true, message: "Relation deleted successfully" };
    } catch (error) {
      console.error("Error deleting relation:", error);
      return { success: false, message: "Error deleting relation", error: error.message };
    }
  }
}
