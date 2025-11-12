const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
        throw new Error(text || "Error al obtener evaluaciones");
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
        const text = await res.text();
        throw new Error(text || "Error al crear evaluación");
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
        const text = await res.text();
        throw new Error(text || "Error al actualizar evaluación");
    }
    return res.json();
}