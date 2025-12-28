import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import evaluationService from "../services/evaluation.service";
import { showAlert } from "../helpers/sweetAlert";

export default function ViewEvaluationsSection() {
  const { token } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await evaluationService.getProfessorReviews(token);
        // Extract data from the wrapped response structure
        setEvaluations(Array.isArray(response) ? response : response.data || []);
      } catch (error) {
        showAlert("error", "Error", error.message || "No se pudieron cargar las evaluaciones");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <div className="evaluations-list-section">
      <h2>Evaluaciones Realizadas</h2>
      {loading && <p>Cargando evaluaciones...</p>}
      {!loading && evaluations.length === 0 && <p>No hay evaluaciones registradas.</p>}

      {!loading && evaluations.length > 0 && (
        <div className="evaluations-cards">
          {evaluations.map((ev) => (
            <div key={ev.id} className="evaluation-card">
              <div className="evaluation-header">
                <p><strong>Fecha:</strong> {new Date(ev.fecha_evaluacion).toLocaleString()}</p>
                <p><strong>Estudiante:</strong> {ev.estudiante?.nombreCompleto || ""}</p>
                <p><strong>Pauta:</strong> {ev.pauta?.nombre_pauta || ""}</p>
                {ev.repeticion && <p><strong>Repetición:</strong> Sí</p>}
              </div>

              <div className="evaluation-details">
                <h4>Evaluación #{ev.id} — {ev.pauta?.nombre_pauta}</h4>
                {ev.detalles?.length ? (
                  ev.detalles.map((det) => (
                    <div key={det.id} className="detail-item">
                      <p><strong>Ítem:</strong> {det.item?.descripcion} (Máx: {det.item?.puntaje_maximo})</p>
                      <p><strong>Puntaje:</strong> {det.puntaje_obtenido}</p>
                      {det.comentario && <p><strong>Comentario:</strong> {det.comentario}</p>}
                    </div>
                  ))
                ) : (
                  <p className="no-details">Sin detalles (ausencia o datos no registrados).</p>
                )}
              </div>

              <div className="evaluation-footer">
                <p><strong>Puntaje Total:</strong> {ev.puntaje_obtenido}</p>
                <p><strong>Nota:</strong> {ev.nota}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
