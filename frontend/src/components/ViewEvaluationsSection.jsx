import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import evaluationService from "../services/evaluation.service";
import { showAlert } from "../helpers/sweetAlert";

export default function ViewEvaluationsSection() {
  const { token } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPautas, setExpandedPautas] = useState({});
  const [selectedEval, setSelectedEval] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [editLoading, setEditLoading] = useState(false);

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

  const groupedByPauta = useMemo(() => {
    const groups = {};
    evaluations.forEach((ev) => {
      const key = ev.pauta?.nombre_pauta || "Sin nombre";
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return Object.entries(groups).map(([pautaNombre, evals]) => ({ pautaNombre, evals }));
  }, [evaluations]);

  const togglePauta = (name) => {
    setExpandedPautas((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  useEffect(() => {
    if (!selectedEval || !selectedEval.detalles) {
      setEditValues({});
      setIsEditing(false);
      return;
    }
    const next = {};
    selectedEval.detalles.forEach((det) => {
      if (det.item?.id == null) return;
      next[det.item.id] = {
        puntaje: det.puntaje_obtenido,
        comentario: det.comentario || "",
      };
    });
    setEditValues(next);
    setIsEditing(false);
  }, [selectedEval]);

  const handleEditChange = (itemId, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedEval) return;
    if (!selectedEval.detalles?.length) {
      showAlert("error", "Error", "No hay detalles para editar");
      return;
    }

    const puntajesItems = selectedEval.detalles.map((det) => {
      const current = editValues[det.item?.id] || {};
      return {
        itemId: det.item?.id,
        puntaje: Number(current.puntaje ?? det.puntaje_obtenido),
        comentario: current.comentario ?? null,
      };
    });

    setEditLoading(true);
    try {
      const resp = await evaluationService.updateStudentEvaluation(
        selectedEval.id,
        { puntajesItems },
        token
      );

      const updatedEval = resp?.data || resp?.evaluacion || resp;
      if (!updatedEval?.id) {
        throw new Error(resp?.message || "Respuesta inesperada del servidor");
      }

      showAlert("success", "Éxito", resp?.message || "Evaluación actualizada");

      setEvaluations((prev) => prev.map((ev) => (ev.id === updatedEval.id ? updatedEval : ev)));
      setSelectedEval(updatedEval);
      setIsEditing(false);
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudo actualizar la evaluación");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="evaluations-list-section">
      <h2>Evaluaciones Realizadas</h2>
      {loading && <p>Cargando evaluaciones...</p>}
      {!loading && evaluations.length === 0 && <p>No hay evaluaciones registradas.</p>}

      {!loading && evaluations.length > 0 && (
        <div className="evaluations-accordion">
          {groupedByPauta.map(({ pautaNombre, evals }) => (
            <div key={pautaNombre} className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => togglePauta(pautaNombre)}
              >
                <span className="accordion-title">{pautaNombre}</span>
                <span className="accordion-count">{evals.length} evals</span>
                <span className={`accordion-icon ${expandedPautas[pautaNombre] ? "open" : ""}`}>
                  ▾
                </span>
              </button>
              {expandedPautas[pautaNombre] && (
                <div className="accordion-body">
                  {evals.map((ev) => (
                    <button
                      key={ev.id}
                      className="evaluation-row"
                      onClick={() => setSelectedEval(ev)}
                    >
                      <div className="row-left">
                        <p className="row-student">{ev.estudiante?.nombreCompleto || ""}</p>
                        <p className="row-date">{formatDate(ev.fecha_evaluacion)}</p>
                      </div>
                      <div className="row-right">
                        <span className="badge score">{ev.puntaje_obtenido} pts</span>
                        <span className="badge grade">Nota {ev.nota}</span>
                        {ev.repeticion && <span className="badge repeat">Repetición</span>}
                        {ev.fecha_edicion && <span className="badge edit">Editado</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedEval && (
        <div className="evaluation-modal-overlay" onClick={() => setSelectedEval(null)}>
          <div className="evaluation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {(selectedEval.pauta?.nombre_pauta || "Evaluación")}
                {selectedEval.fecha_edicion ? " (editado)" : ""}
              </h3>
              <button className="close-btn" onClick={() => setSelectedEval(null)}>×</button>
            </div>
            <div className="modal-meta">
              <p><strong>Fecha:</strong> {formatDate(selectedEval.fecha_evaluacion)}</p>
              <p><strong>Estudiante:</strong> {selectedEval.estudiante?.nombreCompleto || ""}</p>
              <p><strong>Asiste:</strong> {selectedEval.asiste ? "Sí" : "No"}</p>
              {selectedEval.repeticion && <p><strong>Repetición:</strong> Sí</p>}
              {selectedEval.fecha_edicion && (
                <p><strong>Edición:</strong> {formatDate(selectedEval.fecha_edicion)}</p>
              )}
            </div>
            <div className="modal-details">
              <div className="modal-details-header">
                <h4>Detalles</h4>
                {selectedEval.asiste && selectedEval.detalles?.length > 0 && (
                  <button
                    className="edit-toggle-btn"
                    onClick={() => setIsEditing((v) => !v)}
                  >
                    {isEditing ? "Cancelar" : "Editar"}
                  </button>
                )}
              </div>

              {!isEditing && (
                <>
                  {selectedEval.detalles?.length ? (
                    selectedEval.detalles.map((det) => (
                      <div key={det.id} className="detail-item">
                        <p><strong>Ítem:</strong> {det.item?.descripcion} (Máx: {det.item?.puntaje_maximo})</p>
                        <p><strong>Puntaje:</strong> {det.puntaje_obtenido}</p>
                        {det.comentario && <p><strong>Comentario:</strong> {det.comentario}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="no-details">Sin detalles (ausencia o datos no registrados).</p>
                  )}
                </>
              )}

              {isEditing && (
                <div className="edit-form">
                  {selectedEval.detalles?.map((det) => (
                    <div key={det.id} className="detail-item">
                      <p><strong>Ítem:</strong> {det.item?.descripcion} (Máx: {det.item?.puntaje_maximo})</p>
                      <label>
                        Puntaje
                        <input
                          type="number"
                          min="0"
                          max={det.item?.puntaje_maximo}
                          value={editValues[det.item?.id]?.puntaje ?? ""}
                          onChange={(e) => handleEditChange(det.item?.id, "puntaje", e.target.value)}
                        />
                      </label>
                      <label>
                        Comentario
                        <textarea
                          rows={3}
                          value={editValues[det.item?.id]?.comentario ?? ""}
                          onChange={(e) => handleEditChange(det.item?.id, "comentario", e.target.value)}
                        />
                      </label>
                    </div>
                  ))}
                  <div className="edit-actions">
                    <button
                      className="save-btn"
                      onClick={handleSaveEdit}
                      disabled={editLoading}
                    >
                      {editLoading ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <p><strong>Puntaje Total:</strong> {selectedEval.puntaje_obtenido}</p>
              <p><strong>Nota:</strong> {selectedEval.nota}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
