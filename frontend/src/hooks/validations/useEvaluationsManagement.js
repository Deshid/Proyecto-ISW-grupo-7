import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import evaluationService from "../../services/evaluation.service";
import { showAlert } from "../../helpers/sweetAlert";

//Hook para manejar toda la lógica de evaluaciones
export const useEvaluationsManagement = () => {
    const { token } = useAuth();
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedPautas, setExpandedPautas] = useState({});
    const [selectedEval, setSelectedEval] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({});
    const [initialEditValues, setInitialEditValues] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [searchStudent, setSearchStudent] = useState("");
    const [searchPauta, setSearchPauta] = useState("");
    const [searchStudentInput, setSearchStudentInput] = useState("");
    const [searchPautaInput, setSearchPautaInput] = useState("");
    const [groups, setGroups] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(3);
    const [totalPages, setTotalPages] = useState(1);

  /**
   * Obtiene las evaluaciones del profesor agrupadas
   */
const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
        const resp = await evaluationService.getProfessorReviewsGrouped(
        {
            searchPauta,
            searchStudent,
            page,
            limit,
            order: "desc",
        },
        token
        );
        const payload = resp?.data || {};
        const g = Array.isArray(payload.groups) ? payload.groups : [];
        setGroups(g);
        setEvaluations(g.flatMap((gr) => gr.evals || []));
        setTotalPages(Number(payload.totalPages || 1));
        setPage(Number(payload.page || 1));
    } catch (error) {
        showAlert(
            "error",
            "Error",
            error.message || "No se pudieron cargar las evaluaciones"
        );
    } finally {
        setLoading(false);
    }
}, [token, searchPauta, searchStudent, page, limit]);

    // Aplica filtros sólo cuando el usuario lo confirma
    const applySearchFilters = () => {
        setPage(1);
        setSearchStudent(searchStudentInput);
        setSearchPauta(searchPautaInput);
    };

  // Alterna la expansión de un grupo de pautas
    const togglePauta = (name) => {
        setExpandedPautas((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    //Actualiza el estado de edición cuando se selecciona una evaluación
    useEffect(() => {
        if (!selectedEval || !selectedEval.detalles) {
        setEditValues({});
        setInitialEditValues({});
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
    setInitialEditValues(JSON.parse(JSON.stringify(next))); // Deep copy
    setIsEditing(false);
    }, [selectedEval]);

  //maneja cambios en los valores de edición
    const handleEditChange = (itemId, field, value) => {
        setEditValues((prev) => ({
        ...prev,
        [itemId]: {
            ...prev[itemId],
            [field]: value,
        },
        }));
    };

  // Detecta si hay cambios respecto a los valores iniciales
    const hasChanges = useMemo(() => {
        if (!initialEditValues || Object.keys(initialEditValues).length === 0) {
        return false;
        }

        for (const itemId in initialEditValues) {
            const initial = initialEditValues[itemId];
            const current = editValues[itemId];

        if (!current) return true;

        const initialPuntaje = Number(initial.puntaje);
        const currentPuntaje = Number(current.puntaje);
        const initialComentario = (initial.comentario || "").trim();
        const currentComentario = (current.comentario || "").trim();

        if (
            initialPuntaje !== currentPuntaje ||
            initialComentario !== currentComentario
        ) {
            return true;
        }
    }

    return false;
    }, [editValues, initialEditValues]);

  // Guarda los cambios de una evaluación editada
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

        const updatedEval =
            resp?.data?.evaluacion ||
            resp?.evaluacion ||
            resp?.data ||
            resp;
        if (!updatedEval?.id) {
            throw new Error(
            resp?.message || "Respuesta inesperada del servidor"
        );
        }

        showAlert(
            "success",
            "Éxito",
            resp?.message || "Evaluación actualizada"
        );

        const wasAbsent = !selectedEval.asiste;
        if (wasAbsent) {
            updatedEval.asiste = true;
            updatedEval.repeticion = true;
        }

        setEvaluations((prev) =>
            prev.map((ev) => (ev.id === updatedEval.id ? updatedEval : ev))
        );
        setSelectedEval(updatedEval);
        setIsEditing(false);

        await fetchEvaluations();
        } catch (error) {
        showAlert(
            "error",
            "Error",
            error.message || "No se pudo actualizar la evaluación"
        );
        } finally {
        setEditLoading(false);
        }
    };

    return {
        // Estados
        evaluations,
        loading,
        expandedPautas,
        selectedEval,
        isEditing,
        editValues,
        editLoading,
        searchStudent,
        searchPauta,
        groups,
        page,
        totalPages,
        hasChanges,

        // Setters
        setSelectedEval,
        setIsEditing,
        searchStudentInput,
        searchPautaInput,
        setPage,

        setSearchStudentInput,
        setSearchPautaInput,
        // Handlers
        fetchEvaluations,
        togglePauta,
        handleEditChange,
        handleSaveEdit,
        applySearchFilters,
    };
};
