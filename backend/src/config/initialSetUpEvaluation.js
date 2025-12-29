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
    const estudiantes = await userRepo.find({ where: { rol: "estudiante" }, take: 5 });

    if (pautas.length === 0 || estudiantes.length < 1) {
      console.warn("No hay suficientes pautas/estudiantes para seed de evaluaciones.");
      return;
    }

    const sumMax = (p) => p.items.reduce((acc, it) => acc + Number(it.puntaje_maximo), 0);
    const gradeFn = (s, m, e) => {
      try { return calculateGrade(s, m, e); } catch { return calcGradeSafe(s, m, e); }
    };

    // ========== ESTUDIANTE 1: asiste=true, repeticion=false (NORMAL) ==========
    if (estudiantes[0]) {
      const est1 = estudiantes[0];
      
      for (let i = 0; i < Math.min(pautas.length, 3); i++) {
        let eval1 = await evalRepo.findOne({
          where: { estudiante: { id: est1.id }, pauta: { id: pautas[i].id }, asiste: true, repeticion: false }
        });
        if (!eval1) {
          const max = sumMax(pautas[i]);
          const score = Math.round(max * (0.60 + i * 0.10));
          const nota = gradeFn(score, max, Number(pautas[i].porcentaje_escala));
          eval1 = evalRepo.create({
            estudiante: { id: est1.id },
            pauta: { id: pautas[i].id },
            asiste: true,
            repeticion: false,
            puntaje_obtenido: score,
            nota: nota,
          });
          const saved1 = await evalRepo.save(eval1);
          const detalles1 = pautas[i].items.map((item) => {
            const puntaje = Math.round(Number(item.puntaje_maximo) * (0.60 + i * 0.10));
            return detalleRepo.create({
              evaluacion: { id: saved1.id },
              item: { id: item.id },
              puntaje_obtenido: puntaje,
              comentario: "Evaluación normal",
            });
          });
          await detalleRepo.save(detalles1);
        }
      }
    }

    // ========== ESTUDIANTE 2: asiste=false (AUSENTE + REPETICIÓN) ==========
    if (estudiantes[1]) {
      const est2 = estudiantes[1];
      const pautaAus = pautas[0];

      // Primer intento: ausente (asiste=false, repeticion=false)
      let evalAbsent = await evalRepo.findOne({
        where: { estudiante: { id: est2.id }, pauta: { id: pautaAus.id }, asiste: false, repeticion: false }
      });
      if (!evalAbsent) {
        evalAbsent = evalRepo.create({
          estudiante: { id: est2.id },
          pauta: { id: pautaAus.id },
          asiste: false,
          repeticion: false,
          puntaje_obtenido: 0,
          nota: 1.0,
        });
        await evalRepo.save(evalAbsent);
      }

      // Segundo intento: repetición (asiste=false, repeticion=true)
      let evalRepeat = await evalRepo.findOne({
        where: { estudiante: { id: est2.id }, pauta: { id: pautaAus.id }, asiste: false, repeticion: true }
      });
      if (!evalRepeat) {
        const max = sumMax(pautaAus);
        const score = Math.round(max * 0.70);
        const nota = gradeFn(score, max, Number(pautaAus.porcentaje_escala));
        evalRepeat = evalRepo.create({
          estudiante: { id: est2.id },
          pauta: { id: pautaAus.id },
          asiste: false,
          repeticion: true,
          puntaje_obtenido: score,
          nota: nota,
        });
        const savedRepeat = await evalRepo.save(evalRepeat);
        const detallesRepeat = pautaAus.items.map((item) => {
          const puntaje = Math.round(Number(item.puntaje_maximo) * 0.70);
          return detalleRepo.create({
            evaluacion: { id: savedRepeat.id },
            item: { id: item.id },
            puntaje_obtenido: puntaje,
            comentario: "Repetición por ausencia inicial",
          });
        });
        await detalleRepo.save(detallesRepeat);
      }
    }

    // ========== ESTUDIANTE 3: asiste=true, repeticion=false (NORMAL) ==========
    if (estudiantes[2]) {
      const est3 = estudiantes[2];
      
      for (let i = 0; i < Math.min(pautas.length, 2); i++) {
        let eval3 = await evalRepo.findOne({
          where: { estudiante: { id: est3.id }, pauta: { id: pautas[i].id }, asiste: true, repeticion: false }
        });
        if (!eval3) {
          const max = sumMax(pautas[i]);
          const score = Math.round(max * 0.75);
          const nota = gradeFn(score, max, Number(pautas[i].porcentaje_escala));
          eval3 = evalRepo.create({
            estudiante: { id: est3.id },
            pauta: { id: pautas[i].id },
            asiste: true,
            repeticion: false,
            puntaje_obtenido: score,
            nota: nota,
          });
          const saved3 = await evalRepo.save(eval3);
          const detalles3 = pautas[i].items.map((item) => {
            const puntaje = Math.round(Number(item.puntaje_maximo) * 0.75);
            return detalleRepo.create({
              evaluacion: { id: saved3.id },
              item: { id: item.id },
              puntaje_obtenido: puntaje,
              comentario: "Buen desempeño",
            });
          });
          await detalleRepo.save(detalles3);
        }
      }
    }

    // ========== ESTUDIANTE 4: asiste=true, repeticion=false (BAJO PUNTAJE) ==========
    if (estudiantes[3]) {
      const est4 = estudiantes[3];
      
      for (let i = 0; i < Math.min(pautas.length, 3); i++) {
        let eval4 = await evalRepo.findOne({
          where: { estudiante: { id: est4.id }, pauta: { id: pautas[i].id }, asiste: true, repeticion: false }
        });
        if (!eval4) {
          const max = sumMax(pautas[i]);
          const score = Math.round(max * 0.45);
          const nota = gradeFn(score, max, Number(pautas[i].porcentaje_escala));
          eval4 = evalRepo.create({
            estudiante: { id: est4.id },
            pauta: { id: pautas[i].id },
            asiste: true,
            repeticion: false,
            puntaje_obtenido: score,
            nota: nota,
          });
          const saved4 = await evalRepo.save(eval4);
          const detalles4 = pautas[i].items.map((item) => {
            const puntaje = Math.round(Number(item.puntaje_maximo) * 0.45);
            return detalleRepo.create({
              evaluacion: { id: saved4.id },
              item: { id: item.id },
              puntaje_obtenido: puntaje,
              comentario: "Desempeño bajo",
            });
          });
          await detalleRepo.save(detalles4);
        }
      }
    }

    // ========== ESTUDIANTE 5: MIX (AUSENTE + NORMAL) ==========
    if (estudiantes[4]) {
      const est5 = estudiantes[4];

      // Una ausencia (asiste=false, repeticion=false)
      let evalAus5 = await evalRepo.findOne({
        where: { estudiante: { id: est5.id }, pauta: { id: pautas[0].id }, asiste: false, repeticion: false }
      });
      if (!evalAus5) {
        evalAus5 = evalRepo.create({
          estudiante: { id: est5.id },
          pauta: { id: pautas[0].id },
          asiste: false,
          repeticion: false,
          puntaje_obtenido: 0,
          nota: 1.0,
        });
        await evalRepo.save(evalAus5);
      }

      // Evaluaciones normales en otras pautas (asiste=true, repeticion=false)
      for (let i = 1; i < Math.min(pautas.length, 3); i++) {
        let eval5 = await evalRepo.findOne({
          where: { estudiante: { id: est5.id }, pauta: { id: pautas[i].id }, asiste: true, repeticion: false }
        });
        if (!eval5) {
          const max = sumMax(pautas[i]);
          const score = Math.round(max * 0.80);
          const nota = gradeFn(score, max, Number(pautas[i].porcentaje_escala));
          eval5 = evalRepo.create({
            estudiante: { id: est5.id },
            pauta: { id: pautas[i].id },
            asiste: true,
            repeticion: false,
            puntaje_obtenido: score,
            nota: nota,
          });
          const saved5 = await evalRepo.save(eval5);
          const detalles5 = pautas[i].items.map((item) => {
            const puntaje = Math.round(Number(item.puntaje_maximo) * 0.80);
            return detalleRepo.create({
              evaluacion: { id: saved5.id },
              item: { id: item.id },
              puntaje_obtenido: puntaje,
              comentario: "Excelente desempeño",
            });
          });
          await detalleRepo.save(detalles5);
        }
      }
    }

    console.log("* => Evaluaciones de estudiantes por defecto creadas/actualizadas");
  } catch (error) {
    console.error("Error creando evaluaciones de estudiantes:", error);
  }
}
