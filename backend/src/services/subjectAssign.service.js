
"use strict";
import { AppDataSource } from "../config/configDb.js";
import UserSubjectSchema from "../entity/userSubject.entity.js";
import UserSchema from "../entity/user.entity.js";
import SubjectSchema from "../entity/subject.entity.js";

const UserSubjectRepository = AppDataSource.getRepository(UserSubjectSchema);
const UserRepository = AppDataSource.getRepository(UserSchema);
const SubjectRepository = AppDataSource.getRepository(SubjectSchema);

export class SubjectAssignService {
    // Asignar usuario a tema (crear relación)
    static async assignUserToSubject(userId, subjectId) {
        try {
            // Verificar que existen usuario y tema
            const user = await UserRepository.findOneBy({ id: userId });
            const subject = await SubjectRepository.findOneBy({ id: subjectId });
            
            if (!user) {
                return {
                    success: false,
                    message: "Usuario no encontrado"
                };
            }
            
            if (!subject) {
                return {
                    success: false,
                    message: "Tema no encontrado"
                };
            }
            
            // Verificar si ya existe la relación
            const existingRelation = await UserSubjectRepository.findOneBy({
                userId,
                subjectId
            });
            
            if (existingRelation) {
                return {
                    success: false,
                    message: "El usuario ya está asignado a este tema"
                };
            }
            
            // Crear nueva relación
            const newRelation = UserSubjectRepository.create({
                userId,
                subjectId
            });
            
            const savedRelation = await UserSubjectRepository.save(newRelation);
            
            return {
                success: true,
                message: "Usuario asignado al tema correctamente",
                data: {
                    relationId: savedRelation.id,
                    userId: user.id,
                    userName: user.nombreCompleto,
                    subjectId: subject.id,
                    subjectName: subject.nombre,
                    assignedAt: savedRelation.assignedAt
                }
            };
            
        } catch (error) {
            console.error("Error asignando usuario a tema:", error);
            return {
                success: false,
                message: "Error al crear relación",
                error: error.message
            };
        }
    }
    
    // Remover relación usuario-tema
    static async removeUserFromSubject(userId, subjectId) {
        try {
            // Buscar la relación
            const relation = await UserSubjectRepository.findOneBy({
                userId,
                subjectId
            });
            
            if (!relation) {
                return {
                    success: false,
                    message: "Relación no encontrada"
                };
            }
            
            // Eliminar la relación
            await UserSubjectRepository.remove(relation);
            
            return {
                success: true,
                message: "Usuario removido del tema correctamente"
            };
            
        } catch (error) {
            console.error("Error removiendo usuario de tema:", error);
            return {
                success: false,
                message: "Error al remover relación",
                error: error.message
            };
        }
    }
    
    // Obtener todos los usuarios asignados a un tema
    static async getUsersBySubject(subjectId) {
        try {
            // Obtener todas las relaciones para este tema
            const relations = await UserSubjectRepository.find({
                where: { subjectId },
                relations: [] // No hay relación directa, necesitamos JOIN manual
            });
            
            // Obtener los detalles de cada usuario
            const userIds = relations.map(r => r.userId);
            const users = await UserRepository.findByIds(userIds);
            
            // Combinar datos
            const result = relations.map(relation => {
                const user = users.find(u => u.id === relation.userId);
                return {
                    relationId: relation.id,
                    assignedAt: relation.assignedAt,
                    user: user || null
                };
            });
            
            return {
                success: true,
                data: result,
                message: `Usuarios asignados al tema ${subjectId}`,
                count: result.length
            };
            
        } catch (error) {
            console.error("Error obteniendo usuarios por tema:", error);
            return {
                success: false,
                message: "Error al obtener usuarios",
                error: error.message
            };
        }
    }
    
    // Obtener todos los temas asignados a un usuario
    static async getSubjectsByUser(userId) {
        try {
            // Obtener todas las relaciones para este usuario
            const relations = await UserSubjectRepository.find({
                where: { userId }
            });
            
            // Obtener los detalles de cada tema
            const subjectIds = relations.map(r => r.subjectId);
            const subjects = await SubjectRepository.findByIds(subjectIds);
            
            // Combinar datos
            const result = relations.map(relation => {
                const subject = subjects.find(s => s.id === relation.subjectId);
                return {
                    relationId: relation.id,
                    assignedAt: relation.assignedAt,
                    subject: subject || null
                };
            });
            
            return {
                success: true,
                data: result,
                message: `Temas asignados al usuario ${userId}`,
                count: result.length
            };
            
        } catch (error) {
            console.error("Error obteniendo temas por usuario:", error);
            return {
                success: false,
                message: "Error al obtener temas",
                error: error.message
            };
        }
    }
    
    // Obtener una relación específica
    static async getRelation(userId, subjectId) {
        try {
            const relation = await UserSubjectRepository.findOneBy({
                userId,
                subjectId
            });
            
            if (!relation) {
                return {
                    success: false,
                    message: "Relación no encontrada"
                };
            }
            
            return {
                success: true,
                data: relation,
                message: "Relación encontrada"
            };
        } catch (error) {
            console.error("Error obteniendo relación:", error);
            return {
                success: false,
                message: "Error al obtener relación",
                error: error.message
            };
        }
    }

    // Eliminar TODOS los temas asignados a un usuario
    static async removeAllSubjectsFromUser(userId) {
    try {
        // Buscar todas las relaciones del usuario
        const relations = await UserSubjectRepository.find({
        where: { userId }
        });
        
        if (relations.length === 0) {
        return {
            success: true,
            message: "El usuario no tiene temas asignados",
            removedCount: 0
        };
        }
        
        // Eliminar todas las relaciones
        await UserSubjectRepository.remove(relations);
        
        return {
        success: true,
        message: `Se eliminaron ${relations.length} tema(s) del usuario`,
        removedCount: relations.length,
        data: relations
        };
        
    } catch (error) {
        console.error(`Error eliminando temas del usuario ${userId}:`, error);
        return {
        success: false,
        message: "Error al eliminar temas del usuario",
        error: error.message
        };
    }
    }

    // En RelationService.js
    static async cleanOrphanRelations() {
    try {
        // Obtener todos los subject_id existentes
        const existingSubjects = await SubjectRepository.find({ select: ['id'] });
        const existingSubjectIds = existingSubjects.map(s => s.id);
        
        // Encontrar relaciones con subject_id que no existen
        const orphanRelations = await UserSubjectRepository
        .createQueryBuilder('relation')
        .where('relation.subjectId NOT IN (:...ids)', { ids: existingSubjectIds.length > 0 ? existingSubjectIds : [0] })
        .getMany();
        
        if (orphanRelations.length === 0) {
        return {
            success: true,
            message: "No hay relaciones huérfanas",
            removedCount: 0
        };
        }
        
        // Eliminarlas
        await UserSubjectRepository.remove(orphanRelations);
        
        return {
        success: true,
        message: `Se eliminaron ${orphanRelations.length} relación(es) huérfana(s)`,
        removedCount: orphanRelations.length,
        data: orphanRelations
        };
        
    } catch (error) {
        console.error("Error limpiando relaciones huérfanas:", error);
        return {
        success: false,
        message: "Error limpiando relaciones",
        error: error.message
        };
    }
    }
}