/**
 * Formatea una fecha al formato: DD-MM-YYYY, HH:MM
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada o "Sin fecha" si es inválida
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Sin fecha";

  try {
    const date = new Date(dateString);

    // Validar que sea una fecha válida
    if (isNaN(date.getTime())) {
      return "Sin fecha";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  } catch (_) {
    return "Sin fecha";
  }
};

/**
 * Formatea una fecha solo a formato: DD-MM-YYYY
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada o "Sin fecha" si es inválida
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return "Sin fecha";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Sin fecha";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (_) {
    return "Sin fecha";
  }
};

/**
 * Formatea una fecha solo a formato: HH:MM
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Hora formateada o "Sin hora" si es inválida
 */
export const formatTimeOnly = (dateString) => {
  if (!dateString) return "Sin hora";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Sin hora";
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  } catch (error) {
    return "Sin hora";
  }
};
