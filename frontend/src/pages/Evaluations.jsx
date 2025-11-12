import { useEffect, useState } from "react";
import { getEvaluations, updateEvaluation, createEvaluation } from "../services/evaluation.service.js";
import { useAuth } from "../context/AuthContext.jsx";
import EditEvaluationForm from "../components/EditEvaluationForm.jsx";
import "@styles/evaluations.css";

export default function Evaluations() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [evaluations, setEvaluations] = useState([]);
    const [error, setError] = useState(null);
    const [editingEvaluation, setEditingEvaluation] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newEvaluation, setNewEvaluation] = useState({
        nombre_pauta: "",
        items: [{ descripcion: "", puntaje_maximo: "" }]
    });

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const data = await getEvaluations(token);
            setEvaluations(data || []);
        } catch (err) {
            setError(err.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvaluations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

    const handleEdit = (evaluation) => {
        setEditingEvaluation(evaluation);
    };

    const handleSave = async (updatedData) => {
        try {
            await updateEvaluation(editingEvaluation.id, updatedData, token);
            setEditingEvaluation(null);
            fetchEvaluations();
        } catch (err) {
            alert("Error al actualizar: " + err.message);
        }
    };

    const handleCancel = () => {
        setEditingEvaluation(null);
    };

    const handleCreateToggle = () => {
        setIsCreating(!isCreating);
        if (!isCreating) {
            setNewEvaluation({
                nombre_pauta: "",
                items: [{ descripcion: "", puntaje_maximo: "" }]
            });
        }
    };

    const handleNewEvaluationChange = (field, value) => {
        setNewEvaluation({ ...newEvaluation, [field]: value });
    };

    const handleAddItem = () => {
        setNewEvaluation({
            ...newEvaluation,
            items: [...newEvaluation.items, { descripcion: "", puntaje_maximo: "" }]
        });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newEvaluation.items];
        updatedItems[index][field] = value;
        setNewEvaluation({ ...newEvaluation, items: updatedItems });
    };

    const handleRemoveItem = (index) => {
        const updatedItems = newEvaluation.items.filter((_, i) => i !== index);
        setNewEvaluation({ ...newEvaluation, items: updatedItems });
    };

    const handleSubmitNewEvaluation = async () => {
        // Validación
        if (!newEvaluation.nombre_pauta.trim()) {
            alert("El nombre de la pauta es requerido");
            return;
        }

        const validItems = newEvaluation.items.filter(
            item => item.descripcion.trim() && item.puntaje_maximo
        );

        if (validItems.length === 0) {
            alert("Debes agregar al menos un ítem válido");
            return;
        }

        // Convertir puntajes a número
        const itemsToSend = validItems.map(item => ({
            descripcion: item.descripcion.trim(),
            puntaje_maximo: parseInt(item.puntaje_maximo, 10)
        }));

        try {
            await createEvaluation({
                nombre_pauta: newEvaluation.nombre_pauta.trim(),
                items: itemsToSend
            }, token);
            setIsCreating(false);
            setNewEvaluation({
                nombre_pauta: "",
                items: [{ descripcion: "", puntaje_maximo: "" }]
            });
            fetchEvaluations();
        } catch (err) {
            alert("Error al crear evaluación: " + err.message);
        }
    };

    if (loading) return <div className="loading-message">Cargando evaluaciones...</div>;
    if (error) return <div className="evaluation-error-message">Error: {error}</div>;

    return (
        <>
            <div className="evaluations-container">
                <div className="evaluations-header">
                    <h2>Mis Evaluaciones</h2>
                    <button onClick={handleCreateToggle} className="btn-create-evaluation">
                        {isCreating ? "Cancelar" : "Crear Evaluación"}
                    </button>
                </div>

                {/* Formulario de creación */}
                {isCreating && (
                    <div className="create-evaluation-form">
                        <div className="create-form-header">
                            <h3>Nueva Evaluación</h3>
                        </div>
                        <div className="create-form-group">
                            <label htmlFor="nombre-pauta">Nombre de la Pauta:</label>
                            <input
                                id="nombre-pauta"
                                type="text"
                                value={newEvaluation.nombre_pauta}
                                onChange={(e) => handleNewEvaluationChange("nombre_pauta", e.target.value)}
                                placeholder="Ingrese el nombre de la pauta"
                                className="create-input"
                            />
                        </div>

                        <div className="create-items-section">
                            <h4>Items de la Pauta</h4>
                            {newEvaluation.items.map((item, index) => (
                                <div key={index} className="create-item-row">
                                    <input
                                        type="text"
                                        value={item.descripcion}
                                        onChange={(e) => handleItemChange(index, "descripcion", e.target.value)}
                                        placeholder="Descripción del ítem"
                                        className="create-item-input"
                                    />
                                    <input
                                        type="number"
                                        value={item.puntaje_maximo}
                                        onChange={(e) => handleItemChange(index, "puntaje_maximo", e.target.value)}
                                        placeholder="Puntaje"
                                        min="1"
                                        step="1"
                                        className="create-score-input"
                                    />
                                    {newEvaluation.items.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="btn-remove-item"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={handleAddItem} className="btn-add-item">
                                + Agregar Ítem
                            </button>
                        </div>

                        <div className="create-form-actions">
                            <button onClick={handleSubmitNewEvaluation} className="btn-submit-evaluation">
                                Subir Pauta
                            </button>
                        </div>
                    </div>
                )}

                {/* Listado de evaluaciones */}
                {!evaluations.length && !isCreating ? (
                    <div className="empty-message">No hay evaluaciones disponibles</div>
                ) : (
                    <ul className="evaluations-list">
                        {evaluations.map((e) => (
                            <li key={e.id} className="evaluation-card">
                                <div className="evaluation-card-header">
                                    <h3 className="evaluation-title">{e.nombre_pauta}</h3>
                                    <button onClick={() => handleEdit(e)} className="btn-edit">
                                        Editar
                                    </button>
                                </div>
                                {e.items && e.items.length > 0 && (
                                    <ul className="items-list">
                                        {e.items.map((it) => (
                                            <li key={it.id} className="item-row">
                                                <span className="item-description">{it.descripcion}</span>
                                                <span className="item-score">{it.puntaje_maximo} pts</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {editingEvaluation && (
                <EditEvaluationForm
                    evaluation={editingEvaluation}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </>
    );
}