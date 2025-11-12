import { useState } from "react";
import "@styles/form.css";

export default function EditEvaluationForm({ evaluation, onSave, onCancel }) {
    const [nombrePauta, setNombrePauta] = useState(evaluation.nombre_pauta);
    const [items, setItems] = useState(evaluation.items || []);

    const handleAddItem = () => {
        setItems([...items, { descripcion: "", puntaje_maximo: 1 }]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!nombrePauta.trim()) {
            alert("El nombre de la pauta es requerido");
            return;
        }
        if (items.length === 0) {
            alert("Debe haber al menos un item");
            return;
        }
        for (const item of items) {
            if (!item.descripcion.trim()) {
                alert("Todos los items deben tener descripción");
                return;
            }
            if (item.puntaje_maximo < 1) {
                alert("Los puntajes deben ser al menos 1");
                return;
            }
        }

        onSave({
            nombre_pauta: nombrePauta,
            items: items.map(it => ({
                descripcion: it.descripcion,
                puntaje_maximo: Number(it.puntaje_maximo)
            }))
        });
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
                            onChange={(e) => setNombrePauta(e.target.value)}
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
