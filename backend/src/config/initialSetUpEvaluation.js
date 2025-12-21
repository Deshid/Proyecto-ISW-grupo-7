"use strict";
import { AppDataSource } from "./configDb.js";
import { calculateGrade } from "../helpers/calculateGrade.helper.js";

export async function createDefaultEvaluations() {
  try {
    const pautaRepo = AppDataSource.getRepository("Pauta");
    const itemRepo = AppDataSource.getRepository("ItemPauta");
    const userRepo = AppDataSource.getRepository("User");

    const definitions = [
      {
        nombre_pauta: "Evaluación Parcial 1",
        profesorEmail: "profesor1.2024@gmail.cl",
        items: [
          { descripcion: "Pregunta 1", puntaje_maximo: 5 },
          { descripcion: "Pregunta 2", puntaje_maximo: 10 },
          { descripcion: "Pregunta 3", puntaje_maximo: 8 },
        ],
      },
      {
        nombre_pauta: "Evaluación Parcial 2",
        profesorEmail: "profesor2.2024@gmail.cl",
        items: [
          { descripcion: "Ejercicio 1", puntaje_maximo: 6 },
          { descripcion: "Ejercicio 2", puntaje_maximo: 9 },
          { descripcion: "Ejercicio 3", puntaje_maximo: 10 },
        ],
      },
      {
        nombre_pauta: "Evaluación Diagnóstica",
        profesorEmail: "profesor1.2024@gmail.cl",
        items: [
          { descripcion: "Item A", puntaje_maximo: 7 },
          { descripcion: "Item B", puntaje_maximo: 8 },
          { descripcion: "Item C", puntaje_maximo: 5 },
        ],
      },
    ];

    for (const def of definitions) {
      const exists = await pautaRepo.findOne({ where: { nombre_pauta: def.nombre_pauta } });
      if (exists) continue;

      let profesor = await userRepo.findOne({ where: { email: def.profesorEmail } });
      if (!profesor) profesor = await userRepo.findOne({ where: { rol: "profesor" } });
      if (!profesor) {
        console.warn(`Profesor no encontrado para ${def.nombre_pauta}, se omite.`);
        continue;
      }

      const pauta = pautaRepo.create({
        nombre_pauta: def.nombre_pauta,
        creador: { id: profesor.id },
      });
      const savedPauta = await pautaRepo.save(pauta);

      const itemsEntities = def.items.map((it) =>
        itemRepo.create({
          descripcion: it.descripcion,
          puntaje_maximo: it.puntaje_maximo,
          pauta: { id: savedPauta.id },
        })
      );
      await itemRepo.save(itemsEntities);
    }

    console.log("* => Pautas por defecto creadas");
  } catch (error) {
    console.error("Error creando pautas por defecto:", error);
  }
}

export async function createDefaultStudentEvaluations() {
  try {
    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
    const already = await evalRepo.count();
    if (already > 0) return;

    const userRepo = AppDataSource.getRepository("User");
    const pautaRepo = AppDataSource.getRepository("Pauta");

    const pautas = await pautaRepo.find({ relations: ["items"] });
    const estudiantes = await userRepo.find({ where: { rol: "estudiante" }, take: 3 });

    if (pautas.length === 0 || estudiantes.length === 0) return;

    const plans = [
      { estudiante: estudiantes[0], pauta: pautas[0], percent: 0.50 }, // bajo el 51%
      { estudiante: estudiantes[1], pauta: pautas[1] ?? pautas[0], percent: 0.75 }, // aprobado
      { estudiante: estudiantes[2], pauta: pautas[2] ?? pautas[0], percent: 1.00 }, // máximo
    ];

    for (const plan of plans) {
      const maxSum = plan.pauta.items.reduce((acc, it) => acc + Number(it.puntaje_maximo), 0);
      const puntaje_obtenido = Math.min(maxSum, Math.round(maxSum * plan.percent));
      const porcentaje_escala = Number(plan.pauta.porcentaje_escala);
      const nota = calculateGrade(puntaje_obtenido, maxSum, porcentaje_escala);

      const evaluacion = evalRepo.create({
        estudiante: { id: plan.estudiante.id },
        pauta: { id: plan.pauta.id },
        puntaje_obtenido,
        nota,
      });
      await evalRepo.save(evaluacion);
    }

    console.log("* => Evaluaciones de estudiantes por defecto creadas");
  } catch (error) {
    console.error("Error creando evaluaciones de estudiantes:", error);
  }
}