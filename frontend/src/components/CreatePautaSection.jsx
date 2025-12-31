import { useCreatePauta } from "../hooks/validations/useCreatePauta";

const CreatePautaSection = () => {
  const {
    formData,
    loading,
    handleNombreChange,
    handleItemChange,
    addItem,
    removeItem,
    handleSubmit,
  } = useCreatePauta();

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
