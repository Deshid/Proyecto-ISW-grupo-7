import { useEffect } from "react";
import { useEvaluationsManagement } from "../hooks/validations/useEvaluationsManagement";
import { formatDate } from "../helpers/dateFormatter";

export default function ViewEvaluationsSection() {
  const {
    evaluations,
    loading,
    expandedPautas,
    selectedEval,
    isEditing,
    editValues,
    editLoading,
    searchStudent,
    searchPauta,
    searchStudentInput,
    searchPautaInput,
    groups,
    page,
    totalPages,
    hasChanges,
    setSelectedEval,
    setIsEditing,
    setSearchStudentInput,
    setSearchPautaInput,
    setPage,
    fetchEvaluations,
    togglePauta,
    handleEditChange,
    handleSaveEdit,
    applySearchFilters,
  } = useEvaluationsManagement();

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  return (
    <div className="evaluations-list-section">
      <h2>Evaluaciones Realizadas</h2>

      {!loading && (
        <form
          className="evaluations-search"
          onSubmit={(e) => {
            e.preventDefault();
            applySearchFilters();
          }}
        >
          <input
            type="text"
            placeholder="Busca por estudiante..."
            value={searchStudentInput}
            onChange={(e) => setSearchStudentInput(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Busca por pauta..."
            value={searchPautaInput}
            onChange={(e) => setSearchPautaInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">Buscar</button>
        </form>
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
                {selectedEval.detalles?.length > 0 && (selectedEval.asiste || selectedEval.repeticion) && (
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
                      disabled={editLoading || !hasChanges}
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
