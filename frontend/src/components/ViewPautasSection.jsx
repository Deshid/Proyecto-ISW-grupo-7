import { useEffect } from "react";
import { usePautasManagement } from "../hooks/validations/usePautasManagement";
import { formatDate } from "../helpers/dateFormatter";

const ViewPautasSection = () => {
  const {
    pautas,
    loading,
    expandedPautaId,
    editingPautaId,
    viewMode,
    searchPautaNombreInput,
    page,
    totalPages,
    editFormData,
    setViewMode,
    setPage,
    setSearchPautaNombreInput,
    fetchPautas,
    toggleExpanded,
    handleEditClick,
    handleCancelEdit,
    handleEditFormChange,
    handleEditItemChange,
    addEditItem,
    removeEditItem,
    handleSaveEdit,
    handleDeleteClick,
    applyPautaSearch,
  } = usePautasManagement();

  useEffect(() => {
    fetchPautas();
  }, [fetchPautas]);

  if (loading) {
    return <div className="loading">Cargando pautas...</div>;
  }

  return (
    <div className="view-pautas-section">
      <h2>Mis Pautas de Evaluación</h2>

      <div className="pautas-view-tabs">
        <button
          className={`view-tab-btn ${viewMode === "editar" ? "active" : ""}`}
          onClick={() => {
            setPage(1);
            setViewMode("editar");
          }}
        >
          <i className="material-symbols-outlined">edit</i> Editar Pautas
        </button>
        <button
          className={`view-tab-btn ${viewMode === "revisar" ? "active" : ""}`}
          onClick={() => {
            setPage(1);
            setViewMode("revisar");
          }}
        >
          <i className="material-symbols-outlined">checklist</i> Revisar Pautas
        </button>
      </div>

      <form
        className="pautas-search"
        onSubmit={(e) => {
          e.preventDefault();
          applyPautaSearch();
        }}
      >
        <input
          type="text"
          placeholder="Busca una pauta..."
          value={searchPautaNombreInput}
          onChange={(e) => setSearchPautaNombreInput(e.target.value)}
          className="pauta-search-input"
        />
        <button type="submit" className="btn-search">Buscar</button>
      </form>

      {pautas.length === 0 ? (
        <div className="empty-state">
          {viewMode === "editar"
            ? "No hay pautas sin evaluaciones. ¡Crea una nueva!"
            : "No hay pautas con evaluaciones aún."}
        </div>
      ) : (
        <div className="pautas-list">
          {pautas.map((pauta) => (
            <div key={pauta.id} className="pauta-card">
              {editingPautaId === pauta.id ? (
                // Formulario de edición
                <div className="pauta-edit-form">
                  <h3>Editar Pauta</h3>
                  <div className="form-group">
                    <label htmlFor={`edit-nombre-${pauta.id}`}>Nombre de la Pauta</label>
                    <input
                      type="text"
                      id={`edit-nombre-${pauta.id}`}
                      value={editFormData.nombre_pauta}
                      onChange={(e) => handleEditFormChange("nombre_pauta", e.target.value)}
                      placeholder="Nombre de la pauta"
                    />
                  </div>

                  <div className="items-section">
                    <h4>Ítems</h4>
                    {editFormData.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <input
                          type="text"
                          value={item.descripcion}
                          onChange={(e) => handleEditItemChange(index, "descripcion", e.target.value)}
                          placeholder="Descripción"
                          className="item-input"
                        />
                        <input
                          type="number"
                          value={item.puntaje_maximo}
                          onChange={(e) => handleEditItemChange(index, "puntaje_maximo", e.target.value)}
                          placeholder="Puntaje máximo"
                          className="score-input"
                        />
                        {editFormData.items.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeEditItem(index)}
                            aria-label="Eliminar ítem"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="add-item-row">
                      <button
                        type="button"
                        className="btn-add-item"
                        onClick={addEditItem}
                      >
                        + Agregar Ítem
                      </button>
                    </div>
                    
                  </div>

                  <div className="edit-actions">
                    <button
                      className="btn-save"
                      onClick={() => handleSaveEdit(pauta.id)}
                    >
                      Guardar
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Vista normal
                <>
                  <div
                    className="pauta-header"
                    onClick={() => toggleExpanded(pauta.id)}
                  >
                    <div className="pauta-info">
                      <h3>{pauta.nombre_pauta}</h3>
                      <span className="pauta-meta">
                        {pauta.items?.length || 0} ítems · Creada: {formatDate(pauta.fecha_modificacion)}
                        {pauta.tieneEvaluaciones && (
                          <span className="pauta-eval-badge"> · {pauta.evaluacionesCount} evaluaciones</span>
                        )}
                      </span>
                    </div>
                    <span className={`toggle-icon ${expandedPautaId === pauta.id ? "expanded" : ""}`}>
                      ▼
                    </span>
                  </div>

                  {expandedPautaId === pauta.id && (
                    <div className="pauta-content">
                      <div className="items-list">
                        <h4>Ítems de Evaluación:</h4>
                        <ul>
                          {pauta.items?.map((item, index) => (
                            <li key={index}>
                              <strong>{item.descripcion}</strong> - Puntaje Máximo: {item.puntaje_maximo}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pauta-actions">
                        {!pauta.tieneEvaluaciones && (
                          <button
                            className="btn-edit"
                            onClick={() => handleEditClick(pauta)}
                          >
                            <i className="material-symbols-outlined">edit</i>
                            Editar
                          </button>
                        )}
                        {!pauta.tieneEvaluaciones && (
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteClick(pauta.id)}
                          >
                            <i className="material-symbols-outlined">delete</i>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
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
    </div>
  );
};

export default ViewPautasSection;