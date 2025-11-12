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