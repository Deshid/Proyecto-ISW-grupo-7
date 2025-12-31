import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import evaluationService from "../../services/evaluation.service";
import { showAlert } from "../../helpers/sweetAlert";

// Hook para manejar toda la lógica de pautas

export const usePautasManagement = () => {
    const { token } = useAuth();
    const [pautas, setPautas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPautaId, setExpandedPautaId] = useState(null);
    const [editingPautaId, setEditingPautaId] = useState(null);
    const [viewMode, setViewMode] = useState("editar"); // "editar" o "revisar"
    const [searchPautaNombre, setSearchPautaNombre] = useState("");
    const [searchPautaNombreInput, setSearchPautaNombreInput] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(3);
    const [totalPages, setTotalPages] = useState(1);
    const [editFormData, setEditFormData] = useState({
        nombre_pauta: "",
        items: [],
    });

  // Obtiene las pautas del servidor
    const fetchPautas = useCallback(async () => {
        setLoading(true);
        try {
        const hasEvaluations = viewMode === "revisar";
        const resp = await evaluationService.getPautasPaginated(
            {
            hasEvaluations,
            search: searchPautaNombre,
            page,
            limit,
            sortBy: "fecha_modificacion",
            order: "desc",
            },
            token
        );
        const payload = resp?.data || {};
        setPautas(Array.isArray(payload.items) ? payload.items : []);
        setTotalPages(Number(payload.totalPages || 1));
        setPage(Number(payload.page || 1));
        } catch (error) {
        showAlert(
            "error",
            "Error",
            error.message || "No se pudieron cargar las pautas"
        );
        } finally {
        setLoading(false);
        }
        }, [viewMode, searchPautaNombre, page, limit, token]);

    // Aplica el filtro de búsqueda sólo al confirmar
        const applyPautaSearch = () => {
                setPage(1);
                setSearchPautaNombre(searchPautaNombreInput);
        };

  // Alterna la expansión de una pauta
    const toggleExpanded = (pautaId) => {
        setExpandedPautaId(expandedPautaId === pautaId ? null : pautaId);
    };

  // Inicia el modo de edición de una pauta

    const handleEditClick = (pauta) => {
        setEditingPautaId(pauta.id);
        setEditFormData({
        nombre_pauta: pauta.nombre_pauta,
        items: pauta.items?.map((item) => ({ ...item })) || [],
        });
    };

  // Cancela la edición
    const handleCancelEdit = () => {
        setEditingPautaId(null);
        setEditFormData({ nombre_pauta: "", items: [] });
    };

  // Maneja cambios en los campos del formulario de edición
    const handleEditFormChange = (field, value) => {
        setEditFormData({ ...editFormData, [field]: value });
    };

  // Maneja cambios en los items de la pauta durante edición
    const handleEditItemChange = (index, field, value) => {
        const newItems = [...editFormData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditFormData({ ...editFormData, items: newItems });
    };

    // Agrega un nuevo ítem vacío durante la edición
    const addEditItem = () => {
        const newItems = [...editFormData.items, { descripcion: "", puntaje_maximo: "" }];
        setEditFormData({ ...editFormData, items: newItems });
    };

    // Elimina un ítem por índice durante la edición
    const removeEditItem = (index) => {
        if (editFormData.items.length <= 1) return; // mantener al menos un ítem
        const newItems = editFormData.items.filter((_, i) => i !== index);
        setEditFormData({ ...editFormData, items: newItems });
    };

   // Guarda los cambios de una pauta editada
   // Validación delegada al backend Joi
    const handleSaveEdit = async (pautaId) => {
        try {
        await evaluationService.updateEvaluation(
            pautaId,
            editFormData,
            token
        );
        showAlert("success", "Éxito", "Pauta actualizada exitosamente");
        setEditingPautaId(null);
        fetchPautas();
        } catch (error) {
        showAlert(
            "error",
            "Error",
            error.message || "No se pudo actualizar la pauta"
        );
        }
    };

  // Elimina una pauta (con confirmación)
    const handleDeleteClick = async (pautaId) => {
        if (
        confirm(
            "¿Estás seguro de que deseas eliminar esta pauta? Esta acción no se puede deshacer."
        )
        ) {
        try {
            await evaluationService.deleteEvaluation(pautaId, token);
            showAlert("success", "Éxito", "Pauta eliminada exitosamente");
            fetchPautas();
        } catch (error) {
            showAlert(
            "error",
            "Error",
            error.message || "No se pudo eliminar la pauta"
            );
        }
        }
    };

    return {
        // Estados
        pautas,
        loading,
        expandedPautaId,
        editingPautaId,
        viewMode,
        searchPautaNombre,
        searchPautaNombreInput,
        page,
        totalPages,
        editFormData,

        // Setters
        setViewMode,
        setPage,
        setSearchPautaNombreInput,
        setEditFormData,

        // Handlers
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
    };
};
