"use strict";
import { AppDataSource } from "../config/configDb.js";
import UserSubjectSchema from "../entity/UserSubject.entity.js";
import SubjectSchema from "../entity/Subject.entity.js";

const UserSubjectRepository = AppDataSource.getRepository(UserSubjectSchema);
const SubjectRepository = AppDataSource.getRepository(SubjectSchema);

export class CleanupController {
    static async cleanupOrphanRelations(req, res) {
        try {
            console.log("🔄 Iniciando limpieza con TypeORM Repository...");
            
            // 1. Asegurar conexión
            if (!AppDataSource.isInitialized) {
                console.log("⚡ Conectando a la base de datos...");
                await AppDataSource.initialize();
                console.log("✅ Base de datos conectada");
            }
            
            // 2. Obtener todos los IDs de subjects que SÍ existen
            const existingSubjects = await SubjectRepository.find({ 
                select: ['id'] 
            });
            const existingSubjectIds = existingSubjects.map(s => s.id);
            
            console.log(`📊 Subjects existentes: ${existingSubjectIds.length}`);
            
            // 3. Buscar relaciones donde subjectId NO esté en la lista de existentes
            // TypeORM QueryBuilder usa los nombres de propiedades (subjectId), no de columnas
            const orphanRelations = await UserSubjectRepository
                .createQueryBuilder('userSubject')
                .where('userSubject.subjectId NOT IN (:...ids)', { 
                    ids: existingSubjectIds.length > 0 ? existingSubjectIds : [0] 
                })
                .getMany();
            
            console.log(`🔍 Relaciones huérfanas encontradas: ${orphanRelations.length}`);
            
            if (orphanRelations.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "✅ No hay relaciones huérfanas",
                    deletedCount: 0
                });
            }
            
            // 4. Eliminar las relaciones huérfanas
            const deleteResult = await UserSubjectRepository.remove(orphanRelations);
            
            console.log(`✅ Eliminadas: ${orphanRelations.length} relaciones`);
            
            return res.status(200).json({
                success: true,
                message: `✅ Se eliminaron ${orphanRelations.length} relación(es) huérfana(s)`,
                deletedCount: orphanRelations.length,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error("❌ Error en limpieza con TypeORM:", error.message);
            console.error("Stack:", error.stack);
            
            return res.status(500).json({
                success: false,
                message: "Error durante la limpieza",
                error: error.message,
                details: "Error usando TypeORM Repository"
            });
        }
    }
    
    // Método para verificar sin eliminar
    static async checkOrphanRelations(req, res) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }
            
            const existingSubjects = await SubjectRepository.find({ 
                select: ['id'] 
            });
            const existingSubjectIds = existingSubjects.map(s => s.id);
            
            const orphanRelations = await UserSubjectRepository
                .createQueryBuilder('userSubject')
                .select(['userSubject.id', 'userSubject.userId', 'userSubject.subjectId', 'userSubject.assignedAt'])
                .where('userSubject.subjectId NOT IN (:...ids)', { 
                    ids: existingSubjectIds.length > 0 ? existingSubjectIds : [0] 
                })
                .getMany();
            
            return res.status(200).json({
                success: true,
                count: orphanRelations.length,
                data: orphanRelations,
                message: orphanRelations.length > 0 
                    ? `🔍 Se encontraron ${orphanRelations.length} relación(es) huérfana(s)`
                    : "✅ No hay relaciones huérfanas"
            });
            
        } catch (error) {
            console.error("Error verificando relaciones:", error);
            return res.status(500).json({
                success: false,
                message: "Error verificando relaciones",
                error: error.message
            });
        }
    }
}