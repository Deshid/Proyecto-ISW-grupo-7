"use strict";
import { AppDataSource } from "../config/configDb.js";
import SubjectSchema from "../entity/subject.entity.js";



const SubjectRepository = AppDataSource.getRepository(SubjectSchema);

export class SubjectService {
    // Obtener todas las materias
    static async getAllSubjects() {
        try {
            const subjects = await SubjectRepository.find();
            return {
                success: true,
                data: subjects,
                message: "Subjects retrieved successfully"
            };
        } catch (error) {
            console.error("Error fetching subjects:", error);
            return {
                success: false,
                message: "Error fetching subjects",
                error: error.message
            };
        }
    }

    // Obtener una materia por ID
    static async getSubjectById(id) {
        try {
            const subject = await SubjectRepository.findOne({
                where: { id }
            });
            
            if (!subject) {
                return {
                    success: false,
                    message: "Subject not found"
                };
            }
            
            return {
                success: true,
                data: subject,
                message: "Subject retrieved successfully"
            };
        } catch (error) {
            console.error(`Error fetching subject with id ${id}:`, error);
            return {
                success: false,
                message: "Error fetching subject",
                error: error.message
            };
        }
    }

    // Crear una nueva materia
    static async createSubject(subjectData) {
        try {
            const { nombre } = subjectData;
            
            // Validar datos requeridos
            if (!nombre || nombre.trim() === "") {
                return {
                    success: false,
                    message: "Subject name is required"
                };
            }
            
            // Crear la nueva materia
            const newSubject = SubjectRepository.create({
                nombre: nombre.trim()
            });
            
            const savedSubject = await SubjectRepository.save(newSubject);
            
            return {
                success: true,
                data: savedSubject,
                message: "Subject created successfully"
            };
        } catch (error) {
            console.error("Error creating subject:", error);
            return {
                success: false,
                message: "Error creating subject",
                error: error.message
            };
        }
    }

    // Actualizar una materia existente
    static async updateSubject(id, updateData) {
        try {
            const subject = await SubjectRepository.findOne({
                where: { id }
            });
            
            if (!subject) {
                return {
                    success: false,
                    message: "Subject not found"
                };
            }
            
            // Actualizar solo los campos proporcionados
            if (updateData.nombre && updateData.nombre.trim() !== "") {
                subject.nombre = updateData.nombre.trim();
            }
            
            const updatedSubject = await SubjectRepository.save(subject);
            
            return {
                success: true,
                data: updatedSubject,
                message: "Subject updated successfully"
            };
        } catch (error) {
            console.error(`Error updating subject with id ${id}:`, error);
            return {
                success: false,
                message: "Error updating subject",
                error: error.message
            };
        }
    }

    // Eliminar una materia
    static async deleteSubject(id) {
        try {
            const result = await SubjectRepository.delete(id);
            
            if (result.affected === 0) {
                return {
                    success: false,
                    message: "Subject not found"
                };
            }
            
            return {
                success: true,
                message: "Subject deleted successfully"
            };
        } catch (error) {
            console.error(`Error deleting subject with id ${id}:`, error);
            return {
                success: false,
                message: "Error deleting subject",
                error: error.message
            };
        }
    }

    // Buscar materias por nombre (búsqueda parcial)
    static async searchSubjectsByName(searchTerm) {
  try {
    const subjects = await SubjectRepository
      .createQueryBuilder("subject")
      .where("subject.nombre LIKE :name", { name: `%${searchTerm}%` })
      .getMany();
    
    return {
      success: true,
      data: subjects,
      message: subjects.length > 0 
        ? "Subjects found successfully" 
        : "No subjects found"
    };
  } catch (error) {
    console.error("Error searching subjects:", error);
    return {
      success: false,
      message: "Error searching subjects",
      error: error.message
    };
  }
    }

}