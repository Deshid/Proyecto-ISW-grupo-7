import { useEvaluateStudent } from "../hooks/validations/useEvaluateStudent";

const EvaluateStudentSection = () => {
  const {
    pautas,
    students,
    selectedPautaId,
    selectedStudentId,
    loading,
    puntajes,
    comentarios,
    evaluationData,
    selectedPauta,
    setSelectedPautaId,
    setSelectedStudentId,
    handlePuntajeChange,
    handleComentarioChange,
    handleAsistenteChange,
    submitEvaluation,
  } = useEvaluateStudent();

  /**
   * Maneja el envío del formulario
   * Validación delegada al backend Joi
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitEvaluation();
  };

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
              onChange={(e) => setSelectedPautaId(e.target.value)}
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