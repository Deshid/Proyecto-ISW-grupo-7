import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import evaluationService from "../services/evaluation.service";
import { showAlert } from "../helpers/sweetAlert";
//Comentario
export default function ViewEvaluationsSection() {
  const { token } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPautas, setExpandedPautas] = useState({});
  const [selectedEval, setSelectedEval] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [searchStudent, setSearchStudent] = useState("");
  const [searchPauta, setSearchPauta] = useState("");
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await evaluationService.getProfessorReviewsGrouped({
        searchPauta,
        searchStudent,
        page,
        limit,
        order: "desc",
      }, token);
      const payload = resp?.data || {};
      const g = Array.isArray(payload.groups) ? payload.groups : [];
      setGroups(g);
      // Flatten evaluations for modal routines if needed
      setEvaluations(g.flatMap((gr) => gr.evals || []));
      setTotalPages(Number(payload.totalPages || 1));
      setPage(Number(payload.page || 1));
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudieron cargar las evaluaciones");
    } finally {
      setLoading(false);
    }
  }, [token, searchPauta, searchStudent, page, limit]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  // Backend already groups; use groups state directly

  

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

      // La respuesta tiene estructura: { status, message, data: { evaluacion: {...} } }
      const updatedEval = resp?.data?.evaluacion || resp?.evaluacion || resp?.data || resp;
      if (!updatedEval?.id) {
        throw new Error(resp?.message || "Respuesta inesperada del servidor");
      }

      showAlert("success", "Éxito", resp?.message || "Evaluación actualizada");

      // Si era una ausencia, ahora es asiste=true + repeticion=true
      const wasAbsent = !selectedEval.asiste;
      if (wasAbsent) {
        updatedEval.asiste = true;
        updatedEval.repeticion = true;
      }

      setEvaluations((prev) => prev.map((ev) => (ev.id === updatedEval.id ? updatedEval : ev)));
      setSelectedEval(updatedEval);
      setIsEditing(false);
      
      // Actualizar lista completa desde el servidor
      await fetchEvaluations();
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudo actualizar la evaluación");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="evaluations-list-section">
      <h2>Evaluaciones Realizadas</h2>

      {!loading && evaluations.length > 0 && (
        <div className="evaluations-search">
          <input
            type="text"
            placeholder="Busca por estudiante..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Busca por pauta..."
            value={searchPauta}
            onChange={(e) => setSearchPauta(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {loading && <p>Cargando evaluaciones...</p>}
      {!loading && evaluations.length === 0 && <p>No hay evaluaciones registradas.</p>}

      {!loading && groups.length === 0 && (
        <p>No hay evaluaciones que coincidan con tu búsqueda.</p>
      )}

      {!loading && groups.length > 0 && (
        <div className="evaluations-accordion">
          {groups.map(({ pautaNombre, evals }) => (
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
          <div className="pagination">
            <div className="pagination-right">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ◀
              </button>
              <span className="page-info">Página {page} de {totalPages}</span>
              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ▶
              </button>
            </div>
          </div>
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
                {selectedEval.detalles?.length > 0 && (
                  <button
                    className="edit-toggle-btn"
                    onClick={() => setIsEditing((v) => !v)}
                  >
                    {isEditing ? "Cancelar" : (selectedEval.asiste ? "Editar" : "Repetir")}
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
                        <p><strong>Comentario:</strong> {det.comentario || ""}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-details">Sin detalles registrados.</p>
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
