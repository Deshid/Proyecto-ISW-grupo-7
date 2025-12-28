import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import evaluationService from "../services/evaluation.service";
import { showAlert } from "../helpers/sweetAlert";

const EvaluateStudentSection = () => {
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

  useEffect(() => {
    fetchPautas();
    fetchStudents();
  }, []);

  const fetchPautas = async () => {
    try {
      const data = await evaluationService.getEvaluations(token);
      setPautas(data);
    } catch (error) {
      showAlert("error", "Error", "No se pudieron cargar las pautas");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await evaluationService.getStudents(token);

      const studentsList = Array.isArray(response) ? response : response.data || [];
      setStudents(studentsList);
    } catch (error) {
      showAlert("error", "Error", "No se pudieron cargar los estudiantes");
    }
  };

  const handlePuntajeChange = (itemId, value) => {
    setPuntajes({ ...puntajes, [itemId]: value });
  };

  const handleComentarioChange = (itemId, value) => {
    setComentarios({ ...comentarios, [itemId]: value });
  };

  const handleAsistenteChange = (value) => {
    setEvaluationData({
      ...evaluationData,
      asiste: value === "true",
      repeticion: value === "true" ? false : evaluationData.repeticion,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPautaId || !selectedStudentId) {
      showAlert("error", "Error", "Debes seleccionar pauta y estudiante");
      return;
    }

    // Validar puntajes si asiste es true
    if (evaluationData.asiste) {
      const selectedPauta = pautas.find((p) => p.id == selectedPautaId);
      if (
        !selectedPauta ||
        selectedPauta.items.some(
          (item) => puntajes[item.id] === undefined || puntajes[item.id] === ""
        )
      ) {
        showAlert("error", "Error", "Debes ingresar puntajes para todos los ítems");
        return;
      }
    }

    setLoading(true);
    try {
      const puntajesItems = evaluationData.asiste
        ? pautas
            .find((p) => p.id == selectedPautaId)
            .items.map((item) => ({
              itemId: item.id,
              puntaje: Number(puntajes[item.id] ?? 0),
              comentario: comentarios[item.id] ?? null,
            }))
        : [];

      await evaluationService.evaluateStudent(
        {
          pautaId: selectedPautaId,
          estudianteId: selectedStudentId,
          asiste: evaluationData.asiste,
          repeticion: evaluationData.repeticion,
          puntajesItems,
        },
        token
      );

      showAlert("success", "Éxito", "Evaluación registrada exitosamente");
      setSelectedPautaId("");
      setSelectedStudentId("");
      setPuntajes({});
      setEvaluationData({ asiste: true, repeticion: false });
      setComentarios({});
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudo registrar la evaluación");
    } finally {
      setLoading(false);
    }
  };

  const selectedPauta = pautas.find((p) => p.id == selectedPautaId);

  return (
    <div className="evaluate-student-section">
      <h2>Evaluar Estudiante</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pauta">Pauta de Evaluación</label>
            <select
              id="pauta"
              value={selectedPautaId}
              onChange={(e) => {
                setSelectedPautaId(e.target.value);
                setPuntajes({});
              }}
              disabled={loading}
            >
              <option value="">-- Selecciona una pauta --</option>
              {pautas.map((pauta) => (
                <option key={pauta.id} value={pauta.id}>
                  {pauta.nombre_pauta}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="student">Estudiante</label>
            <select
              id="student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Selecciona un estudiante --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nombreCompleto}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="evaluation-options">
          <div className="form-group">
            <label>¿Asistió?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="asiste"
                  value="true"
                  checked={evaluationData.asiste === true}
                  onChange={(e) => handleAsistenteChange(e.target.value)}
                  disabled={loading}
                />
                Sí
              </label>
              <label>
                <input
                  type="radio"
                  name="asiste"
                  value="false"
                  checked={evaluationData.asiste === false}
                  onChange={(e) => handleAsistenteChange(e.target.value)}
                  disabled={loading}
                />
                No
              </label>
            </div>
          </div>

          {!evaluationData.asiste && (
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={evaluationData.repeticion}
                  onChange={(e) =>
                    setEvaluationData({ ...evaluationData, repeticion: e.target.checked })
                  }
                  disabled={loading}
                />
                Marcar como Repetición
              </label>
            </div>
          )}
        </div>

        {selectedPauta && evaluationData.asiste && (
          <div className="puntajes-section">
            <h3>Puntajes por Ítem</h3>
            {selectedPauta.items?.map((item) => (
              <div key={item.id} className="form-group">
                <label htmlFor={`puntaje-${item.id}`}>
                  {item.descripcion} (Máx: {item.puntaje_maximo})
                </label>
                <input
                  type="number"
                  id={`puntaje-${item.id}`}
                  value={puntajes[item.id] || ""}
                  onChange={(e) => handlePuntajeChange(item.id, e.target.value)}
                  min="0"
                  max={item.puntaje_maximo}
                  disabled={loading}
                  placeholder="Ingresa el puntaje"
                />
                <label htmlFor={`comentario-${item.id}`} className="mt-2">Comentario (opcional)</label>
                <textarea
                  id={`comentario-${item.id}`}
                  value={comentarios[item.id] || ""}
                  onChange={(e) => handleComentarioChange(item.id, e.target.value)}
                  disabled={loading}
                  placeholder="Añade un comentario para este ítem"
                  rows={3}
                  style={{ resize: "none", width: "100%", borderRadius: "4px", padding: "8px" }}
                />
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar Evaluación"}
        </button>
      </form>
    </div>
  );
};

export default EvaluateStudentSection;