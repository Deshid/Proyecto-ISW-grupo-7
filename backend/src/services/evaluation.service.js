"use strict";
import { AppDataSource } from "../config/configDb.js";

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
        if (Number(it.puntaje_maximo) < 0) {
            throw new Error("puntaje_maximo no puede ser negativo");
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
    const where = profesorId ? { creador: { id: profesorId } } : {};
    const pautas = await pautaRepo.find({
        where,
        relations: ["items"],
    });
    return pautas;
}

export default { createEvaluation, listEvaluations };