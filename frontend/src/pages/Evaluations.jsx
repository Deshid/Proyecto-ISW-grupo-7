import { useEffect, useState } from "react";
import { getEvaluations } from "../services/evaluation.service.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Evaluations() {
    const { user } = useAuth();
    const token = user?.token || sessionStorage.getItem('token') || '';

    const [loading, setLoading] = useState(true);
    const [evaluations, setEvaluations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
        const data = await getEvaluations(token);
        if (mounted) setEvaluations(data || []);
            } catch (err) {
        if (mounted) setError(err.message || "Error");
            } finally {
        if (mounted) setLoading(false);
        }
        })();
        return () => (mounted = false);
    }, [token]);

    if (loading) return <div>Cargando evaluaciones...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!evaluations.length) return <div>No hay evaluaciones</div>;

    return (
    <div>
        <h2>Evaluaciones</h2>
        <ul>
            {evaluations.map((e) => (
            <li key={e.id || e.pauta?.id}>
                <strong>{e.nombre_evento || e.nombre_pauta}</strong>
                {e.items && (
                <ul>
                    {e.items.map((it) => (
                        <li key={it.id}>{it.descripcion} — {it.puntaje_maximo}</li>
                    ))}
                </ul>
                )}
            </li>
            ))}
        </ul>
    </div>
    );
}