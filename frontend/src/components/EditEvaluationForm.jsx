import { useEditPauta } from "../hooks/validations/useEditPauta";
import "@styles/form.css";

export default function EditEvaluationForm({ evaluation, onSave, onCancel }) {
    const {
        nombrePauta,
        items,
        handleNombreChange,
        handleAddItem,
        handleRemoveItem,
        handleItemChange,
        getFormattedData,
    } = useEditPauta(evaluation);


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(getFormattedData());
    };

    return (
        <div className="evaluation-form-overlay">
            <div className="evaluation-form-container">
                <h2>Editar Evaluación</h2>
                <form onSubmit={handleSubmit}>
                    <div className="evaluation-form-group">
                        <label htmlFor="nombre_pauta">Nombre de la Pauta:</label>
                        <input
                            id="nombre_pauta"
                            type="text"
                            value={nombrePauta}
                            onChange={handleNombreChange}
                            required
                        />
                    </div>

                    <div className="evaluation-form-group">
                        <label>Items de la Pauta:</label>
                        <div className="items-editor">
                            {items.map((item, index) => (
                                <div key={index} className="item-editor-row">
                                    <input
                                        type="text"
                                        placeholder="Descripción del item"
                                        value={item.descripcion}
                                        onChange={(e) => handleItemChange(index, "descripcion", e.target.value)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Puntaje"
                                        value={item.puntaje_maximo}
                                        onChange={(e) => handleItemChange(index, "puntaje_maximo", e.target.value)}
                                        min="1"
                                        step="1"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="btn-remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="btn-add-item"
                            >
                                + Agregar Item
                            </button>
                        </div>
                    </div>

                    <div className="evaluation-form-actions">
                        <button type="submit" className="btn-primary">Guardar Cambios</button>
                        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
