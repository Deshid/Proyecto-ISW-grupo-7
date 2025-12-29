"use strict";
import Joi from "joi";

// Validación para crear pauta
export const createPautaValidation = Joi.object({
  nombre_pauta: Joi.string()
    .min(3)
    .max(255)
    .required()
    .trim()
    .messages({
      "string.empty": "nombre_pauta es requerido",
      "string.min": "nombre_pauta debe tener al menos 3 caracteres",
      "string.max": "nombre_pauta no puede exceder 255 caracteres",
    }),
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        descripcion: Joi.string()
          .min(1)
          .max(500)
          .required()
          .trim()
          .messages({
            "string.empty": "descripcion no puede estar vacía",
          }),
        puntaje_maximo: Joi.number()
          .integer()
          .min(1)
          .max(1000)
          .required()
          .messages({
            "number.base": "puntaje_maximo debe ser un número",
            "number.min": "puntaje_maximo debe ser >= 1",
            "number.max": "puntaje_maximo no puede exceder 1000",
          }),
      })
    )
    .required()
    .messages({
      "array.min": "La pauta debe contener al menos un item",
    }),
  porcentaje_escala: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      "number.base": "porcentaje_escala debe ser un número",
      "number.min": "porcentaje_escala no puede ser negativo",
      "number.max": "porcentaje_escala no puede exceder 100",
    }),
});

// Validación para actualizar pauta
export const updatePautaValidation = Joi.object({
  nombre_pauta: Joi.string()
    .min(3)
    .max(255)
    .required()
    .trim()
    .messages({
      "string.empty": "nombre_pauta es requerido",
      "string.min": "nombre_pauta debe tener al menos 3 caracteres",
      "string.max": "nombre_pauta no puede exceder 255 caracteres",
    }),
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        descripcion: Joi.string()
          .min(1)
          .max(500)
          .required()
          .trim()
          .messages({
            "string.empty": "descripcion no puede estar vacía",
          }),
        puntaje_maximo: Joi.number()
          .integer()
          .min(1)
          .max(1000)
          .required()
          .messages({
            "number.base": "puntaje_maximo debe ser un número",
            "number.min": "puntaje_maximo debe ser >= 1",
            "number.max": "puntaje_maximo no puede exceder 1000",
          }),
      })
    )
    .required()
    .messages({
      "array.min": "La pauta debe contener al menos un item",
    }),
});

// Validación para evaluar estudiante
export const evaluateStudentValidation = Joi.object({
  pautaId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "pautaId debe ser un número",
      "number.positive": "pautaId debe ser positivo",
    }),
  estudianteId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "estudianteId debe ser un número",
      "number.positive": "estudianteId debe ser positivo",
    }),
  asiste: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      "boolean.base": "asiste debe ser verdadero o falso",
    }),
  repeticion: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      "boolean.base": "repeticion debe ser verdadero o falso",
    }),
  puntajesItems: Joi.when("asiste", {
    is: true,
    then: Joi.array()
      .min(1)
      .items(
        Joi.object({
          itemId: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
              "number.base": "itemId debe ser un número",
              "number.positive": "itemId debe ser positivo",
            }),
          puntaje: Joi.number()
            .min(0)
            .required()
            .messages({
              "number.base": "puntaje debe ser un número",
              "number.min": "puntaje no puede ser negativo",
            }),
          comentario: Joi.string()
            .max(1000)
            .allow("", null)
            .optional()
            .messages({
              "string.max": "comentario no puede exceder 1000 caracteres",
            }),
        })
      )
      .required(),
    otherwise: Joi.forbidden(),
  }),
});

// Validación para actualizar evaluación de estudiante
export const updateStudentEvaluationValidation = Joi.object({
  puntajesItems: Joi.array()
    .min(1)
    .items(
      Joi.object({
        itemId: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            "number.base": "itemId debe ser un número",
            "number.positive": "itemId debe ser positivo",
          }),
        puntaje: Joi.number()
          .min(0)
          .required()
          .messages({
            "number.base": "puntaje debe ser un número",
            "number.min": "puntaje no puede ser negativo",
          }),
        comentario: Joi.string()
          .max(1000)
          .allow("", null)
          .optional()
          .messages({
            "string.max": "comentario no puede exceder 1000 caracteres",
          }),
      })
    )
    .required()
    .messages({
      "array.min": "puntajesItems debe tener al menos un elemento",
    }),
});