"use strict";
import { AppDataSource } from "./configDb.js";
import { calculateGrade } from "../helpers/calculateGrade.helper.js";

// Fallback si calculateGrade no está implementado
function calcGradeSafe(puntaje, max, escalaPct) {
  const required = (Number(escalaPct) / 100) * Number(max);
  if (puntaje <= 0) return 1.0;
  let grade;
  if (puntaje < required) {
    grade = 1 + ((puntaje / required) * 3);
  } else {
    const denom = Math.max(1, (max - required));
    grade = 4 + (((puntaje - required) / denom) * 3);
  }
  return Math.min(7, Math.round(grade * 10) / 10);
}

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
    const detalleRepo = AppDataSource.getRepository("DetalleEvaluacion");
    const userRepo = AppDataSource.getRepository("User");
    const pautaRepo = AppDataSource.getRepository("Pauta");

    const pautas = await pautaRepo.find({ relations: ["items"] });
    const estudiantes = await userRepo.find({ where: { rol: "estudiante" }, take: 3 });

    if (pautas.length === 0 || estudiantes.length < 3) {
      console.warn("No hay suficientes pautas/estudiantes para seed de evaluaciones.");
      return;
    }

    const p0 = pautas[0];
    const p1 = pautas[1] ?? p0;
    const p2 = pautas[2] ?? p1;

    const sumMax = (p) => p.items.reduce((acc, it) => acc + Number(it.puntaje_maximo), 0);
    const max0 = sumMax(p0);
    const max1 = sumMax(p1);
    const max2 = sumMax(p2);

    const escala0 = Number(p0.porcentaje_escala);
    const escala1 = Number(p1.porcentaje_escala);
    const escala2 = Number(p2.porcentaje_escala);

    const gradeFn = (s, m, e) => {
      try { return calculateGrade(s, m, e); } catch { return calcGradeSafe(s, m, e); }
    };

    // 1) Ausente: asiste=false, puntaje=0, nota=1.0
    const absentExists = await evalRepo.findOne({
      where: { estudiante: { id: estudiantes[0].id }, pauta: { id: p0.id }, asiste: false }
    });
    if (!absentExists) {
      const evalAbsent = evalRepo.create({
        estudiante: { id: estudiantes[0].id },
        pauta: { id: p0.id },
        asiste: false,
        repeticion: false,
        puntaje_obtenido: 0,
        nota: 1.0,
      });
      await evalRepo.save(evalAbsent);
    }

    // 2) Repetición: crear primera evaluación (asiste=true), luego segunda con repeticion=true
    const prevEval = await evalRepo.findOne({
      where: { estudiante: { id: estudiantes[1].id }, pauta: { id: p1.id } }
    });
    if (!prevEval) {
      const score1 = Math.round(max1 * 0.40); // primera vez, bajo aprobación
      const nota1 = gradeFn(score1, max1, escala1);
      const firstAttempt = evalRepo.create({
        estudiante: { id: estudiantes[1].id },
        pauta: { id: p1.id },
        asiste: true,
        repeticion: false,
        puntaje_obtenido: score1,
        nota: nota1,
      });
      const savedFirst = await evalRepo.save(firstAttempt);
      
      // Crear detalles para primera evaluación
      const detalles1 = p1.items.map((item, idx) => {
        const puntaje = Math.round(Number(item.puntaje_maximo) * 0.40);
        return detalleRepo.create({
          evaluacion: { id: savedFirst.id },
          item: { id: item.id },
          puntaje_obtenido: puntaje,
          comentario: `Intento inicial - item ${idx + 1}`,
        });
      });
      await detalleRepo.save(detalles1);
    }
    // segunda oportunidad (repetición)
    const repExists = await evalRepo.findOne({
      where: { estudiante: { id: estudiantes[1].id }, pauta: { id: p1.id }, repeticion: true }
    });
    if (!repExists) {
      const score2 = Math.round(max1 * 0.80); // mejora en repetición
      const nota2 = gradeFn(score2, max1, escala1);
      const secondAttempt = evalRepo.create({
        estudiante: { id: estudiantes[1].id },
        pauta: { id: p1.id },
        asiste: true,
        repeticion: true,
        puntaje_obtenido: score2,
        nota: nota2,
      });
      const savedSecond = await evalRepo.save(secondAttempt);
      
      // Crear detalles para repetición (mejorados)
      const detalles2 = p1.items.map((item, idx) => {
        const puntaje = Math.round(Number(item.puntaje_maximo) * 0.80);
        return detalleRepo.create({
          evaluacion: { id: savedSecond.id },
          item: { id: item.id },
          puntaje_obtenido: puntaje,
          comentario: `Repetición - mejoró significativamente en item ${idx + 1}`,
        });
      });
      await detalleRepo.save(detalles2);
    }

    // 3) Aprobado: asiste=true, porcentaje alto
    const approvedExists = await evalRepo.findOne({
      where: { estudiante: { id: estudiantes[2].id }, pauta: { id: p2.id }, repeticion: false, asiste: true }
    });
    if (!approvedExists) {
      const score3 = Math.round(max2 * 0.75);
      const nota3 = gradeFn(score3, max2, escala2);
      const evalApproved = evalRepo.create({
        estudiante: { id: estudiantes[2].id },
        pauta: { id: p2.id },
        asiste: true,
        repeticion: false,
        puntaje_obtenido: score3,
        nota: nota3,
      });
      const savedApproved = await evalRepo.save(evalApproved);
      
      // Crear detalles para aprobado
      const detalles3 = p2.items.map((item, idx) => {
        const puntaje = Math.round(Number(item.puntaje_maximo) * 0.75);
        return detalleRepo.create({
          evaluacion: { id: savedApproved.id },
          item: { id: item.id },
          puntaje_obtenido: puntaje,
          comentario: `Buen desempeño en item ${idx + 1}`,
        });
      });
      await detalleRepo.save(detalles3);
    }

    console.log("* => Evaluaciones de estudiantes por defecto creadas/actualizadas");
  } catch (error) {
    console.error("Error creando evaluaciones de estudiantes:", error);
  }
}