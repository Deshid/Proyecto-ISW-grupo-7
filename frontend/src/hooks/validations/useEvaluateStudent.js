import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import evaluationService from "../../services/evaluation.service";
import { showAlert } from "../../helpers/sweetAlert";

// Hook para manejar la evaluación de estudiantes

export const useEvaluateStudent = () => {
    const { token } = useAuth();
    const [pautas, setPautas] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedPautaId, setSelectedPautaId] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [loading, setLoading] = useState(false);
    const [puntajes, setPuntajes] = useState({});
    const [comentarios, setComentarios] = useState({});
    const [evaluationData, setEvaluationData] = useState({
        asiste: true,
        repeticion: false,
    });

  // Carga las pautas del servidor
    const fetchPautas = useCallback(async () => {
        try {
        const data = await evaluationService.getEvaluations(token);
        setPautas(data);
        } catch {
        showAlert("error", "Error", "No se pudieron cargar las pautas");
        }
    }, [token]);

  // Carga los estudiantes asignados del servidor
    const fetchStudents = useCallback(async () => {
        try {
        const studentsList = await evaluationService.getAssignedStudents(token);
        setStudents(Array.isArray(studentsList) ? studentsList : []);
        } catch (error) {
        console.error("[fetchStudents] error:", error);
        showAlert("error", "Error", "No se pudieron cargar los estudiantes asignados");
        }
    }, [token]);

  // Carga datos iniciales
    useEffect(() => {
        fetchPautas();
        fetchStudents();
    }, [fetchPautas, fetchStudents]);

  // Actualiza el puntaje de un item
    const handlePuntajeChange = (itemId, value) => {
        setPuntajes({ ...puntajes, [itemId]: value });
    };

  // Actualiza el comentario de un item
    const handleComentarioChange = (itemId, value) => {
        setComentarios({ ...comentarios, [itemId]: value });
    };

  // Actualiza la selección de asistencia
    const handleAsistenteChange = (value) => {
        setEvaluationData({
        ...evaluationData,
        asiste: value === "true",
        repeticion: value === "true" ? false : evaluationData.repeticion,
        });
    };

  // Prepara el payload para enviar al backend

    const buildPayload = () => {
        const payload = {
        pautaId: selectedPautaId,
        estudianteId: selectedStudentId,
        asiste: evaluationData.asiste,
        repeticion: evaluationData.repeticion,
        };

    // Solo incluir puntajesItems si asiste es true
    if (evaluationData.asiste) {
      const selectedPauta = pautas.find((p) => p.id == selectedPautaId);
      payload.puntajesItems = selectedPauta.items.map((item) => ({
        itemId: item.id,
        puntaje: Number(puntajes[item.id] ?? 0),
        comentario: comentarios[item.id] ?? null,
      }));
    }

    return payload;
  };

  // Envío de la evaluación al backend
  // Validación delegada a Joi

    const submitEvaluation = async () => {
        setLoading(true);
        try {
        const payload = buildPayload();
        await evaluationService.evaluateStudent(payload, token);
        showAlert("success", "Éxito", "Evaluación registrada exitosamente");
        
        // Reset del formulario
        setSelectedPautaId("");
        setSelectedStudentId("");
        setPuntajes({});
        setComentarios({});
        setEvaluationData({ asiste: true, repeticion: false });
        } catch (error) {
        showAlert(
            "error",
            "Error",
            error.message || "No se pudo registrar la evaluación"
        );
        } finally {
        setLoading(false);
        }
    };

    const selectedPauta = pautas.find((p) => p.id == selectedPautaId);

    return {
        // Estados
        pautas,
        students,
        selectedPautaId,
        selectedStudentId,
        loading,
        puntajes,
        comentarios,
        evaluationData,
        selectedPauta,

        // Setters
        setSelectedPautaId,
        setSelectedStudentId,

        // Handlers
        handlePuntajeChange,
        handleComentarioChange,
        handleAsistenteChange,
        submitEvaluation,
    };
};
