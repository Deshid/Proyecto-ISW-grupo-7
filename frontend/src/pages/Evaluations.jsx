import { useState } from "react";
import CreatePautaSection from "../components/CreatePautaSection";
import ViewPautasSection from "../components/ViewPautasSection";
import ViewEvaluationsSection from "../components/ViewEvaluationsSection";
import EvaluateStudentSection from "../components/EvaluateStudentSection";
import "@styles/evaluations.css";

export default function Evaluations() {
  const [activeTab, setActiveTab] = useState("create"); // Por defecto: crear pauta

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreatePautaSection />;
      case "view":
        return <ViewPautasSection />;
      case "view-evaluations":
        return <ViewEvaluationsSection />;
      case "evaluate":
        return <EvaluateStudentSection />;
      default:
        return <CreatePautaSection />;
    }
  };

  return (
    <div className="evaluations-container">
      <div className="evaluations-header">
        <h1>
          <span className="material-symbols-outlined">assignment</span>
          Gestión de Evaluaciones
        </h1>
        <p>Crear pautas, evaluar estudiantes y revisar resultados</p>
      </div>

      <div className="evaluations-tabs">
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          <i className="material-symbols-outlined">note_add</i> Crear Pauta
        </button>
        <button
          className={`tab-button ${activeTab === "view" ? "active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          <i className="material-symbols-outlined">assignment</i> Ver Pautas
        </button>
        <button
          className={`tab-button ${activeTab === "view-evaluations" ? "active" : ""}`}
          onClick={() => setActiveTab("view-evaluations")}
        >
          <i className="material-symbols-outlined">assessment</i> Ver Evaluaciones
        </button>
        <button
          className={`tab-button ${activeTab === "evaluate" ? "active" : ""}`}
          onClick={() => setActiveTab("evaluate")}
        >
          <i className="material-symbols-outlined">edit_note</i> Evaluar Estudiante
        </button>
      </div>

      <div className="evaluations-content">
        {renderContent()}
      </div>
    </div>
  );
}