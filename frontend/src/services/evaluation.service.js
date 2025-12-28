const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ==================== PAUTAS ====================

export async function getEvaluations(token) {
    const res = await fetch(`${API_URL}/api/evaluation/evaluations-list`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al obtener pautas");
    }
    return res.json();
}

export async function getPautaById(pautaId, token) {
    const res = await fetch(`${API_URL}/api/evaluation/${pautaId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al obtener pauta");
    }
    return res.json();
}

    export async function createEvaluation(data, token) {
    const res = await fetch(`${API_URL}/api/evaluation/evaluations-create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear pauta");
    }
    return res.json();
}

    export async function updateEvaluation(pautaId, data, token) {
    const res = await fetch(`${API_URL}/api/evaluation/${pautaId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar pauta");
    }
    return res.json();
}

// ==================== EVALUACIONES DE ESTUDIANTES ====================

/**
 * @param {Object} data - { pautaId, estudianteId, asiste, repeticion, puntajesItems }
 */
export async function evaluateStudent(data, token) {
    const res = await fetch(`${API_URL}/api/evaluation/evaluate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al evaluar estudiante");
    }
    return res.json();
}

/**
 * @param {Number} studentId - ID del estudiante (opcional para profesores)
 */
export async function getStudentGrades(studentId, token) {
    const url = studentId 
        ? `${API_URL}/api/evaluation/grades/${studentId}` 
        : `${API_URL}/api/evaluation/grades`;
    
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al obtener notas");
    }
    return res.json();
}

/**
 * @param {Number} evaluacionId - ID de la evaluación
 * @param {Object} data - { puntajesItems }
 */
export async function updateStudentEvaluation(evaluacionId, data, token) {
    const res = await fetch(`${API_URL}/api/evaluation/student-evaluation/${evaluacionId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar evaluación");
    }
    return res.json();
}