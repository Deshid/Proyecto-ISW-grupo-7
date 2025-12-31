"use strict";
import Joi from "joi";

// Validación para crear pauta
export const createPautaValidation = Joi.object({
  nombre_pauta: Joi.string()
    .min(10)
    .max(50)
    .required()
    .trim()
    .pattern(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/)
    .messages({
      "any.required": "El nombre de la pauta es requerido",
      "string.empty": "El nombre de la pauta no puede estar vacío",
      "string.min": "El nombre debe tener al menos 10 caracteres",
      "string.max": "El nombre de la pauta no puede exceder 50 caracteres",
      "string.pattern.base": "El nombre debe contener letras",
    }),
  items: Joi.array()
    .min(1)   
    .items(
      Joi.object({
        descripcion: Joi.string()
          .min(10)
          .max(500)
          .required()
          .trim()
          .pattern(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/)
          .messages({
            "any.required": "La pregunta es requerida",
            "string.empty": "La pregunta no puede estar vacía",
            "string.min": "La pregunta debe tener al menos 10 caracteres",
            "string.max": "La pregunta no puede exceder 500 caracteres",
            "string.pattern.base": "La pregunta debe contener letras",
          }),
        puntaje_maximo: Joi.number()
          .integer()
          .min(1)
          .max(100)
          .required()
          .messages({
            "any.required": "El puntaje maximo es requerido",
            "number.base": "El puntaje maximo debe ser un número",
            "number.min": "El puntaje maximo debe ser mínimo 1",
            "number.max": "El puntaje maximo no puede exceder 100",
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
      "number.base": "El porcentaje de escala debe ser un número",
      "number.min": "El porcentaje de escala no puede ser negativo",
      "number.max": "El porcentaje de escala no puede exceder 100",
    }),
});

// Validación para actualizar pauta
export const updatePautaValidation = Joi.object({
  nombre_pauta: Joi.string()
    .min(10)
    .max(50)
    .required()
    .trim()
    .pattern(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/)
    .messages({
    "any.required": "El nombre de la pauta es requerido",
    "string.empty": "El nombre de la pauta no puede estar vacío",
    "string.min": "El nombre de la pauta debe tener al menos 10 caracteres",
    "string.max": "El nombre de la pauta no puede exceder 50 caracteres",
    "string.pattern.base": "El nombre de la pauta debe contener letras",
    }),
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        descripcion: Joi.string()
          .min(10)
          .max(500)
          .required()
          .trim()
          .pattern(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/)
          .messages({
            "any.required": "La pregunta actualizada es requerida",
            "string.empty": "La pregunta actualizada no puede estar vacía",
            "string.min": "La pregunta actualizada debe tener al menos 10 caracteres",
            "string.max": "La pregunta actualizada no puede exceder 500 caracteres",
            "string.pattern.base": "La pregunta actualizada debe contener letras",
          }),
        puntaje_maximo: Joi.number()
          .integer()
          .min(1)
          .max(100)
          .required()
          .messages({
            "any.required": "El puntaje maximo es requerido",
            "number.base": "El puntaje maximo debe ser un número",
            "number.min": "El puntaje maximo debe ser mayor o igual a 1",
            "number.max": "El puntaje maximo no puede exceder 100",
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
      "any.required": "Se debe elegir una pauta",
      "number.base": "Debe seleccionar una pauta.",
      "number.positive": "La pauta seleccionada no es válida",
    }),
  estudianteId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El estudiante es requerido",
      "number.base": "Debe seleccionar un estudiante",
      "number.positive": "El id del estudiante debe ser positivo",
    }),
  asiste: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      "any.required": "El campo asiste es requerido",
      "boolean.base": "asiste debe ser Sí o No",
    }),
  repeticion: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      "any.required": "El campo repeticion es requerido",
      "boolean.base": "repeticion debe ser Sí o No",
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
              "any.required": "El id del item es requerido para cada puntaje",
              "number.base": "El id del item debe ser un número",
              "number.integer": "El id del item debe ser un número entero",
              "number.positive": "El id del item debe ser un número positivo",
            }),
          puntaje: Joi.number()
            .min(0)
            .max(1000)
            .required()
            .messages({
              "any.required": "El puntaje es requerido para cada item",
              "number.base": "El puntaje debe ser un número",
              "number.min": "El puntaje no puede ser negativo",
              "number.max": "El puntaje no puede exceder 1000",
              "number.empty": "El puntaje no puede estar vacío",
            }),
          comentario: Joi.string()
            .max(1000)
            .allow("", null)
            .optional()
            .trim()
            .pattern(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/)
            .messages({
              "string.max": "El comentario no puede exceder 1000 caracteres",
              "string.pattern.base": "El comentario debe contener al menos una letra si se proporciona",
            }),
        }).unknown(false)
      )
      .required()
      .messages({
        "array.min": "Debe incluir puntajes para al menos un item",
      }),
    otherwise: Joi.forbidden(),
  }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales",
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
            "any.required": "El id del item es requerido para cada puntaje",
            "number.base": "El id del item debe ser un número",
            "number.integer": "El id del item debe ser un número entero",
            "number.positive": "El id del item debe ser un número positivo",
          }),
        puntaje: Joi.number()
          .min(0)
          .max(1000)
          .required()
          .messages({
            "any.required": "El puntaje es requerido para cada item",
            "number.base": "El puntaje debe ser un número",
            "number.min": "El puntaje no puede ser negativo",
            "number.max": "El puntaje no puede exceder 1000",
          }),
        comentario: Joi.string()
          .max(1000)
          .allow("", null)
          .optional()
          .trim()
          .pattern(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/)
          .messages({
            "string.max": "El comentario no puede exceder 1000 caracteres",
            "string.pattern.base": "El comentario debe contener al menos una letra si se proporciona",
          }),
      }).unknown(false)
    )
    .required()
    .messages({
      "any.required": "puntajesItems es requerido",
      "array.min": "Debe incluir puntajes para al menos un item",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales",
})
;