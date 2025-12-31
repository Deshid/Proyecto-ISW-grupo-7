
/**
 * Valida que el nombre de una pauta sea válido
 * @param {string} nombre - Nombre a validar
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validatePautaNombre = (nombre) => {
  if (!nombre || !nombre.trim()) {
    return {
      isValid: false,
      error: "El nombre de la pauta es obligatorio",
    };
  }

  if (nombre.trim().length < 10) {
    return {
      isValid: false,
      error: "El nombre de la pauta debe tener al menos 10 caracteres",
    };
  }

  if (nombre.trim().length > 50) {
    return {
      isValid: false,
      error: "El nombre de la pauta no puede exceder 50 caracteres",
    };
  }

  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(nombre)) {
    return {
      isValid: false,
      error: "El nombre debe contener al menos una letra",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Valida que los ítems de una pauta sean válidos
 * @param {array} items - Items a validar
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validatePautaItems = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      isValid: false,
      error: "Debe haber al menos un ítem en la pauta",
    };
  }

  for (const item of items) {
    if (!item.descripcion || !item.descripcion.trim()) {
      return {
        isValid: false,
        error: "Todos los ítems deben tener una descripción",
      };
    }

    if (item.descripcion.trim().length < 10) {
      return {
        isValid: false,
        error: "Las descripciones deben tener al menos 10 caracteres",
      };
    }

    if (item.descripcion.trim().length > 500) {
      return {
        isValid: false,
        error: "Las descripciones no pueden exceder 500 caracteres",
      };
    }

    if (!item.puntaje_maximo || item.puntaje_maximo <= 0) {
      return {
        isValid: false,
        error: "Todos los ítems deben tener un puntaje máximo mayor a 0",
      };
    }

    if (item.puntaje_maximo > 100) {
      return {
        isValid: false,
        error: "El puntaje máximo de cada ítem no puede exceder 100",
      };
    }

    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(item.descripcion)) {
      return {
        isValid: false,
        error: "Las descripciones deben contener al menos una letra",
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Valida una pauta completa (nombre + items)
 * @param {string} nombre - Nombre de la pauta
 * @param {array} items - Items de la pauta
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validateCompletePauta = (nombre, items) => {
  const nombreValidation = validatePautaNombre(nombre);
  if (!nombreValidation.isValid) {
    return nombreValidation;
  }

  const itemsValidation = validatePautaItems(items);
  if (!itemsValidation.isValid) {
    return itemsValidation;
  }

  return { isValid: true, error: null };
};

/**
 * Valida que el puntaje sea válido para una evaluación
 * @param {number} puntaje - Puntaje a validar
 * @param {number} puntajeMaximo - Puntaje máximo permitido
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validatePuntaje = (puntaje, puntajeMaximo) => {
  if (puntaje === null || puntaje === undefined || puntaje === "") {
    return {
      isValid: false,
      error: "El puntaje es obligatorio",
    };
  }

  const numPuntaje = Number(puntaje);

  if (isNaN(numPuntaje)) {
    return {
      isValid: false,
      error: "El puntaje debe ser un número",
    };
  }

  if (numPuntaje < 0) {
    return {
      isValid: false,
      error: "El puntaje no puede ser negativo",
    };
  }

  if (puntajeMaximo && numPuntaje > puntajeMaximo) {
    return {
      isValid: false,
      error: `El puntaje no puede exceder ${puntajeMaximo}`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Valida un comentario de evaluación
 * @param {string} comentario - Comentario a validar
 * @param {boolean} isRequired - Si el comentario es obligatorio
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validateComentario = (comentario, isRequired = false) => {
  if (!comentario || comentario.trim() === "") {
    if (isRequired) {
      return {
        isValid: false,
        error: "El comentario es obligatorio",
      };
    }
    return { isValid: true, error: null };
  }

  if (comentario.trim().length > 1000) {
    return {
      isValid: false,
      error: "El comentario no puede exceder 1000 caracteres",
    };
  }

  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(comentario)) {
    return {
      isValid: false,
      error: "El comentario debe contener al menos una letra",
    };
  }

  return { isValid: true, error: null };
};
