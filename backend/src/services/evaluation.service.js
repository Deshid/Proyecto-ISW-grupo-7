"use strict";
import { AppDataSource } from "../config/configDb.js";
import { calculateGrade } from "../helpers/calculateGrade.helper.js";

const createEvaluation = async ({ profesorId, nombre_pauta, items }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const itemRepo = queryRunner.manager.getRepository("ItemPauta");

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("La pauta debe contener al menos un item");
    }
    for (const it of items) {
        if (!it.descripcion || it.puntaje_maximo === undefined) {
            throw new Error("Cada item debe tener 'descripcion' y 'puntaje_maximo'");
        }
        if (Number(it.puntaje_maximo) < 1) {
            throw new Error("puntaje_maximo no puede ser menor que 1");
        }
    }

    const pauta = pautaRepo.create({
        nombre_pauta,
        creador: { id: profesorId },
    });
    const savedPauta = await pautaRepo.save(pauta);

    const itemEntities = items.map((it) =>
        itemRepo.create({
            descripcion: it.descripcion,
            puntaje_maximo: it.puntaje_maximo,
            pauta: { id: savedPauta.id },
        })
    );
    const savedItems = await itemRepo.save(itemEntities);

    await queryRunner.commitTransaction();

    return { message: "Pauta creada exitosamente", pauta: savedPauta, items: savedItems };
    } catch (err) {
        await queryRunner.rollbackTransaction();
    throw err;
    } finally {
        await queryRunner.release();
    }
};

const listEvaluations = async (profesorId) => {
    const pautaRepo = AppDataSource.getRepository("Pauta");
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
    const where = profesorId ? { creador: { id: profesorId } } : {};
    const pautas = await pautaRepo.find({
        where,
        relations: ["items"],
    });
    
    const pautasConEvals = await Promise.all(
        pautas.map(async (pauta) => {
            const evalCount = await evalRepo.count({
                where: { pauta: { id: pauta.id } }
            });
            return {
                ...pauta,
                evaluacionesCount: evalCount,
                tieneEvaluaciones: evalCount > 0
            };
        })
    );
    
    return pautasConEvals;
}

const listPautasPaginated = async (profesorId, {
    hasEvaluations,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "fecha_modificacion",
    order = "DESC",
} = {}) => {
    const pautaRepo = AppDataSource.getRepository("Pauta");
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");

    const where = profesorId ? { creador: { id: profesorId } } : {};
    const pautas = await pautaRepo.find({
        where,
        relations: ["items"],
        order: { [sortBy]: order },
    });

    const searched = (search || "").toLowerCase();
    const filteredBySearch = pautas.filter((p) =>
        (p.nombre_pauta || "").toLowerCase().includes(searched)
    );

    const withCounts = await Promise.all(
        filteredBySearch.map(async (pauta) => {
            const evalCount = await evalRepo.count({ where: { pauta: { id: pauta.id } } });
            return {
                ...pauta,
                evaluacionesCount: evalCount,
                tieneEvaluaciones: evalCount > 0,
            };
        })
    );

    let finalList = withCounts;
    if (hasEvaluations === true) {
        finalList = withCounts.filter((p) => p.tieneEvaluaciones);
    } else if (hasEvaluations === false) {
        finalList = withCounts.filter((p) => !p.tieneEvaluaciones);
    }

    const total = finalList.length;
    const totalPages = Math.max(1, Math.ceil(total / Math.max(1, Number(limit))));
    const currentPage = Math.min(Math.max(1, Number(page)), totalPages);
    const startIndex = (currentPage - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const pageItems = finalList.slice(startIndex, endIndex);

    return {
        status: "success",
        message: "Pautas paginadas",
        data: pageItems,
        page: currentPage,
        limit: Number(limit),
        total,
        totalPages,
    };
};

const listProfessorReviewsGrouped = async (profesorId, {
    searchPauta = "",
    searchStudent = "",
    page = 1,
    limit = 5,
    order = "DESC",
} = {}) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");

    const allEvals = await evalRepo.find({
        where: { pauta: { creador: { id: profesorId } } },
        relations: ["pauta", "pauta.creador", "estudiante", "detalles", "detalles.item"],
        order: { fecha_evaluacion: order },
    });

    const sPauta = (searchPauta || "").toLowerCase();
    const sStud = (searchStudent || "").toLowerCase();

    const filtered = allEvals.filter((ev) => {
        const matchPauta = (ev.pauta?.nombre_pauta || "").toLowerCase().includes(sPauta);
        const matchStud = (ev.estudiante?.nombreCompleto || "").toLowerCase().includes(sStud);
        return matchPauta && matchStud;
    });

    const groupMap = new Map(); // key: pautaId, value: { pautaId, pautaNombre, evals: [] }
    for (const ev of filtered) {
        const pid = ev.pauta?.id;
        const pname = ev.pauta?.nombre_pauta || "Sin nombre";
        if (!pid) continue;
        if (!groupMap.has(pid)) {
            groupMap.set(pid, { pautaId: pid, pautaNombre: pname, evals: [] });
        }
        groupMap.get(pid).evals.push(ev);
    }

    // Sort groups by pauta's recent evaluation date or by name
    const groups = Array.from(groupMap.values()).sort((a, b) => a.pautaNombre.localeCompare(b.pautaNombre));
    const totalGroups = groups.length;
    const totalPages = Math.max(1, Math.ceil(totalGroups / Math.max(1, Number(limit))));
    const currentPage = Math.min(Math.max(1, Number(page)), totalPages);
    const startIndex = (currentPage - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const pageGroups = groups.slice(startIndex, endIndex).map((g) => ({
        pautaId: g.pautaId,
        pautaNombre: g.pautaNombre,
        totalEvals: g.evals.length,
        evals: g.evals,
    }));

    return {
        status: "success",
        message: "Evaluaciones agrupadas",
        data: pageGroups,
        page: currentPage,
        limit: Number(limit),
        totalGroups,
        totalPages,
    };
};


const updateEvaluation = async ({ profesorId, pautaId, nombre_pauta, items }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const itemRepo = queryRunner.manager.getRepository("ItemPauta");

        // Ya no necesitas validar ownership ni conteo de evaluaciones (lo hace el middleware)
        const pauta = await pautaRepo.findOne({
        where: { id: pautaId },
        relations: ["creador"],
        });

        pauta.nombre_pauta = nombre_pauta;
        await pautaRepo.save(pauta);

        await itemRepo.delete({ pauta: { id: pautaId } });

        const itemEntities = items.map((it) =>
        itemRepo.create({
            descripcion: it.descripcion,
            puntaje_maximo: it.puntaje_maximo,
            pauta: { id: pautaId },
        })
        );
        const savedItems = await itemRepo.save(itemEntities);

        await queryRunner.commitTransaction();
        return { message: "Pauta actualizada exitosamente", pauta, items: savedItems };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};


const getEvaluationById = async (id, userId, userRole) => {
    const pautaRepo = AppDataSource.getRepository("Pauta");
    const numericId = Number(id);
    const pauta = await pautaRepo.findOne({
        where: { id: numericId },
        relations: ["creador", "items"],
    });

    if (!pauta) {
        const error = new Error("Pauta no encontrada");
        error.status = 404;
        throw error;
    }
    if (userRole === "profesor" && pauta.creador?.id !== userId) {
        const error = new Error("No autorizado: no eres el creador de esta pauta");
        error.status = 403;
        throw error;
    }

    return pauta;
};

const updateStudentEvaluation = async ({ profesorId, evaluacionId, puntajesItems }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const evalRepo = queryRunner.manager.getRepository("EvaluacionEstudiante");
        const detalleRepo = queryRunner.manager.getRepository("DetalleEvaluacion");

        const evaluacion = await evalRepo.findOne({
            where: { id: evaluacionId },
            relations: ["pauta", "pauta.creador", "pauta.items", "detalles"],
        });

        if (!evaluacion) throw new Error("Evaluación no encontrada");
        if (evaluacion.pauta.creador.id !== profesorId) throw new Error("No autorizado");

        if (!Array.isArray(puntajesItems) || puntajesItems.length !== evaluacion.pauta.items.length) {
            throw new Error("Debe incluir puntajes para todos los items de la pauta");
        }

        let puntajeObtenido = 0;
        const puntajeMaximo = evaluacion.pauta.items.reduce((acc, it) => acc + Number(it.puntaje_maximo), 0);

        for (const item of evaluacion.pauta.items) {
            const pi = puntajesItems.find(p => p.itemId === item.id);
            if (!pi) throw new Error(`Falta puntaje para item ${item.id}`);
            if (Number(pi.puntaje) > Number(item.puntaje_maximo)) {
                throw new Error(`Puntaje ${pi.puntaje} excede el máximo ${item.puntaje_maximo} para item ${item.id}`);
            }
            puntajeObtenido += Number(pi.puntaje);
        }

        const nuevaNota = calculateGrade(puntajeObtenido, puntajeMaximo, evaluacion.pauta.porcentaje_escala);

        // Si era una ausencia, al editarla se convierte en repetición (sin marcar fecha_edicion)
        const wasAbsent = !evaluacion.asiste;
        if (wasAbsent) {
            evaluacion.asiste = true;
            evaluacion.repeticion = true;
        } else {
            // Solo marcar fecha_edicion si ya asistía (es una edición real)
            evaluacion.fecha_edicion = new Date();
        }

        evaluacion.puntaje_obtenido = puntajeObtenido;
        evaluacion.nota = nuevaNota;
        await evalRepo.save(evaluacion);

        await detalleRepo.createQueryBuilder()
        .delete()
        .from("DetalleEvaluacion")
        .where("id_evaluacion = :id", { id: evaluacionId })
        .execute();

        const nuevosDetalles = puntajesItems.map((pi) =>
        detalleRepo.create({
            evaluacion: { id: evaluacionId },
            item: { id: pi.itemId },
            puntaje_obtenido: Number(pi.puntaje),
            comentario: pi.comentario || null,
        })
        );

        await detalleRepo.save(nuevosDetalles);

        const evaluacionActualizada = await evalRepo.findOne({
        where: { id: evaluacionId },
        relations: ["pauta", "pauta.creador", "pauta.items", "estudiante", "detalles", "detalles.item"],
        });

        await queryRunner.commitTransaction();

        return { message: "Evaluación actualizada exitosamente", evaluacion: evaluacionActualizada };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};

const evaluateStudent = async ({ profesorId, 
    pautaId, 
    estudianteId, 
    puntajesItems, 
    asiste: _asiste = true, 
    repeticion: _repeticion = false }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const evalRepo = queryRunner.manager.getRepository("EvaluacionEstudiante");
        const detalleRepo = queryRunner.manager.getRepository("DetalleEvaluacion");

        const pauta = await pautaRepo.findOne({
            where: { id: pautaId },
            relations: ["creador", "items"],
        });

        if (!pauta) throw new Error("Pauta no encontrada");
        if (pauta.creador.id !== profesorId) throw new Error("No autorizado");

        const previa = await evalRepo.findOne({
        where: { estudiante: 
                    { id: estudianteId }, 
                pauta: 
                    { id: pautaId } 
                },
        });
        if (_repeticion && !previa) throw new Error("La repetición solo se permite si existe una evaluación previa");

        console.log("[evaluateStudent] raw flags:", { _asiste, _repeticion });
        const attended = Boolean(_asiste);
        const repeated = Boolean(_repeticion);

        let puntajeObtenido = 0;
        let puntajeMaximo = pauta.items.reduce((acc, it) => acc + Number(it.puntaje_maximo), 0);
        let nota = 1;

        if (attended) {
            for (const item of pauta.items) {
                const puntajeItem = puntajesItems?.find(p => p.itemId === item.id);
                if (!puntajeItem) {
                    const expectedIds = pauta.items.map(it => it.id);
                    const mensaje = `Falta puntaje para item ${item.id}. `
                                  + `Asegúrate de usar los IDs reales de la pauta: ${expectedIds.join(", ")}`;
                    throw new Error(mensaje);
                }
                puntajeObtenido += Number(puntajeItem.puntaje);
            }
            nota = calculateGrade(puntajeObtenido, puntajeMaximo, pauta.porcentaje_escala);
        } else {
            puntajeObtenido = 0;
            nota = 1;
        }

        const evaluacion = evalRepo.create({
            estudiante: { id: estudianteId },
            pauta: { id: pautaId },
            puntaje_obtenido: puntajeObtenido,
            nota,
            asiste: attended,
            repeticion: repeated,
        });

        const savedEval = await evalRepo.save(evaluacion);
        
        if (attended && Array.isArray(puntajesItems) && puntajesItems.length > 0) {
            const detalles = puntajesItems.map(pi =>
                detalleRepo.create({
                    evaluacion: { id: savedEval.id },
                    item: { id: pi.itemId },
                    puntaje_obtenido: Number(pi.puntaje),
                    comentario: pi.comentario || null,
                })
            );

            await detalleRepo.save(detalles);
        } else if (!attended) {
            // Crear detalles con puntaje 0 y sin comentarios para ausencias
            const detalles = pauta.items.map(item =>
                detalleRepo.create({
                    evaluacion: { id: savedEval.id },
                    item: { id: item.id },
                    puntaje_obtenido: 0,
                    comentario: null,
                })
            );

            await detalleRepo.save(detalles);
        }

        await queryRunner.commitTransaction();

        return { message: "Estudiante evaluado exitosamente", evaluacion: savedEval };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};

const getStudentGrades = async (estudianteId) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
    const userRepo = AppDataSource.getRepository("User");
    
    const estudiante = await userRepo.findOne({ where: { id: estudianteId } });
    if (!estudiante) throw new Error("Estudiante no encontrado");
    
    return await evalRepo.find({
        where: { estudiante: { id: estudianteId } },
        relations: ["pauta", "estudiante", "detalles", "detalles.item"],
    });
};

const listProfessorReviews = async (profesorId) => {
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
    return await evalRepo.find({
        where: { pauta: { creador: { id: profesorId } } },
        relations: ["pauta", "pauta.creador", "estudiante", "detalles", "detalles.item"],
        order: { fecha_evaluacion: "DESC" },
    });
};

const deleteEvaluation = async (pautaId, profesorId) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const pautaRepo = queryRunner.manager.getRepository("Pauta");
        const evalRepo = queryRunner.manager.getRepository("EvaluacionEstudiante");
        
        const pauta = await pautaRepo.findOne({
            where: { id: pautaId },
            relations: ["creador"],
        });

        if (!pauta) {
            const error = new Error("Pauta no encontrada");
            error.status = 404;
            throw error;
        }

        if (pauta.creador.id !== profesorId) {
            const error = new Error("No autorizado: no eres el creador de esta pauta");
            error.status = 403;
            throw error;
        }

        const evaluacionesCount = await evalRepo.count({
            where: { pauta: { id: pautaId } }
        });

        if (evaluacionesCount > 0) {
            const error = new Error(`No se puede eliminar una pauta que tiene ${evaluacionesCount}`
                + " evaluación(es) asociada(s)");
            error.status = 400;
            throw error;
        }

        const itemRepo = queryRunner.manager.getRepository("ItemPauta");
        await itemRepo.delete({ pauta: { id: pautaId } });

        await pautaRepo.remove(pauta);
        await queryRunner.commitTransaction();

        return { message: "Pauta eliminada exitosamente" };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};

const listStudents = async () => {
    const userRepo = AppDataSource.getRepository("User");
    return await userRepo.find({
        where: { rol: "estudiante" },
        select: ["id", "nombreCompleto", "email", "rut"],
    });
};

export default {
    createEvaluation,
    listEvaluations,
    listPautasPaginated,
    listProfessorReviewsGrouped,
    updateEvaluation,
    getEvaluationById,    
    evaluateStudent,
    updateStudentEvaluation,
    getStudentGrades,
    listProfessorReviews,
    listStudents,
    deleteEvaluation,
};