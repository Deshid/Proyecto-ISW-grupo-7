import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import evaluationService from "../services/evaluation.service";
import { showAlert } from "../helpers/sweetAlert";

const CreatePautaSection = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nombre_pauta: "",
    items: [{ descripcion: "", puntaje_maximo: "" }],
  });
  const [loading, setLoading] = useState(false);

  const handleNombreChange = (e) => {
    setFormData({ ...formData, nombre_pauta: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { descripcion: "", puntaje_maximo: "" }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_pauta.trim()) {
      showAlert("error", "Error", "El nombre de la pauta es obligatorio");
      return;
    }

    if (formData.items.some((item) => !item.descripcion.trim() || !item.puntaje_maximo)) {
      showAlert("error", "Error", "Todos los ítems deben tener descripción y puntaje máximo");
      return;
    }

    setLoading(true);
    try {
      await evaluationService.createEvaluation(formData, token);
      showAlert("success", "Éxito", "Pauta creada exitosamente");
      setFormData({
        nombre_pauta: "",
        items: [{ descripcion: "", puntaje_maximo: "" }],
      });
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudo crear la pauta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-pauta-section">
      <h2>Crear Nueva Pauta de Evaluación</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre de la Pauta</label>
          <input
            type="text"
            id="nombre"
            value={formData.nombre_pauta}
            onChange={handleNombreChange}
            placeholder="Ej: Evaluación Parcial 1"
            disabled={loading}
          />
        </div>

        <div className="items-section">
          <h3>Ítems de Evaluación</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="form-group">
                <label htmlFor={`item-nombre-${index}`}>Descripción del Ítem</label>
                <input
                  type="text"
                  id={`item-nombre-${index}`}
                  value={item.descripcion}
                  onChange={(e) => handleItemChange(index, "descripcion", e.target.value)}
                  placeholder="Ej: Participación"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`item-puntaje-${index}`}>Puntaje Máximo</label>
                <input
                  type="number"
                  id={`item-puntaje-${index}`}
                  value={item.puntaje_maximo}
                  onChange={(e) => handleItemChange(index, "puntaje_maximo", e.target.value)}
                  placeholder="Ej: 10"
                  min="1"
                  disabled={loading}
                />
              </div>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="btn-remove"
                  disabled={loading}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem} className="btn-add-item" disabled={loading}>
            + Agregar Ítem
          </button>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Pauta"}
        </button>
      </form>
    </div>
  );
};

export default CreatePautaSection;
