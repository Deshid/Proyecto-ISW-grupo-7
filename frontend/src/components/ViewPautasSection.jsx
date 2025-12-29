import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import evaluationService from "../services/evaluation.service";
import { showAlert } from "../helpers/sweetAlert";

const ViewPautasSection = () => {
  const { token } = useAuth();
  const [pautas, setPautas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPautaId, setExpandedPautaId] = useState(null);
  const [editingPautaId, setEditingPautaId] = useState(null);
  const [viewMode, setViewMode] = useState("editar"); // "editar" o "revisar"
  const [searchPautaNombre, setSearchPautaNombre] = useState("");
  const [editFormData, setEditFormData] = useState({
    nombre_pauta: "",
    items: [],
  });

  useEffect(() => {
    fetchPautas();
  }, []);

  const fetchPautas = async () => {
    setLoading(true);
    try {
      const data = await evaluationService.getEvaluations(token);
      setPautas(data);
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudieron cargar las pautas");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (pautaId) => {
    setExpandedPautaId(expandedPautaId === pautaId ? null : pautaId);
  };

  const handleEditClick = (pauta) => {
    setEditingPautaId(pauta.id);
    setEditFormData({
      nombre_pauta: pauta.nombre_pauta,
      items: pauta.items?.map((item) => ({ ...item })) || [],
    });
  };

  const handleCancelEdit = () => {
    setEditingPautaId(null);
    setEditFormData({ nombre_pauta: "", items: [] });
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  const handleEditItemChange = (index, field, value) => {
    const newItems = [...editFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleSaveEdit = async (pautaId) => {
    if (!editFormData.nombre_pauta.trim()) {
      showAlert("error", "Error", "El nombre de la pauta es obligatorio");
      return;
    }

    if (editFormData.items.some((item) => !item.descripcion.trim() || !item.puntaje_maximo)) {
      showAlert("error", "Error", "Todos los ítems deben tener descripción y puntaje máximo");
      return;
    }

    try {
      await evaluationService.updateEvaluation(pautaId, editFormData, token);
      showAlert("success", "Éxito", "Pauta actualizada exitosamente");
      setEditingPautaId(null);
      fetchPautas();
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudo actualizar la pauta");
    }
  };

  const handleDeleteClick = async (pautaId) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta pauta? Esta acción no se puede deshacer.")) {
      try {
        await evaluationService.deleteEvaluation(pautaId, token);
        showAlert("success", "Éxito", "Pauta eliminada exitosamente");
        fetchPautas();
      } catch (error) {
        showAlert("error", "Error", error.message || "No se pudo eliminar la pauta");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Cargando pautas...</div>;
  }

  if (pautas.length === 0) {
    return <div className="empty-state">No hay pautas creadas. ¡Crea una nueva!</div>;
  }

  const pautasSinEvaluaciones = pautas.filter((p) => !p.tieneEvaluaciones);
  const pautasConEvaluaciones = pautas.filter((p) => p.tieneEvaluaciones);

  const pautasParaMostrar = viewMode === "editar" ? pautasSinEvaluaciones : pautasConEvaluaciones;
  
  const pautasFiltradas = pautasParaMostrar.filter((pauta) =>
    pauta.nombre_pauta.toLowerCase().includes(searchPautaNombre.toLowerCase())
  );

  return (
    <div className="view-pautas-section">
      <h2>Mis Pautas de Evaluación</h2>

      <div className="pautas-view-tabs">
        <button
          className={`view-tab-btn ${viewMode === "editar" ? "active" : ""}`}
          onClick={() => setViewMode("editar")}
        >
          ✏️ Editar Pautas ({pautasSinEvaluaciones.length})
        </button>
        <button
          className={`view-tab-btn ${viewMode === "revisar" ? "active" : ""}`}
          onClick={() => setViewMode("revisar")}
        >
          📋 Revisar Pautas ({pautasConEvaluaciones.length})
        </button>
      </div>

      {pautasParaMostrar.length > 0 && (
        <input
          type="text"
          placeholder="Busca una pauta..."
          value={searchPautaNombre}
          onChange={(e) => setSearchPautaNombre(e.target.value)}
          className="pauta-search-input"
        />
      )}

      {pautasParaMostrar.length === 0 ? (
        <div className="empty-state">
          {viewMode === "editar"
            ? "No hay pautas sin evaluaciones. ¡Crea una nueva!"
            : "No hay pautas con evaluaciones aún."}
        </div>
      ) : pautasFiltradas.length === 0 ? (
        <div className="empty-state">No hay pautas que coincidan con tu búsqueda.</div>
      ) : (
        <div className="pautas-list">
          {pautasFiltradas.map((pauta) => (
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
                      </div>
                    ))}
                    
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
                            ✏️ Editar
                          </button>
                        )}
                        {!pauta.tieneEvaluaciones && (
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteClick(pauta.id)}
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewPautasSection;
