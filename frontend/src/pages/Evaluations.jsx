import { useState } from "react";
//import { useAuth } from "../context/AuthContext";
import CreatePautaSection from "../components/CreatePautaSection";
import ViewPautasSection from "../components/ViewPautasSection";
import ViewEvaluationsSection from "../components/ViewEvaluationsSection";
import EvaluateStudentSection from "../components/EvaluateStudentSection";
import "@styles/evaluations.css";

export default function Evaluations() {
  //const { user } = useAuth();
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

      </div>

      <div className="evaluations-tabs">
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          ➕ Crear Pauta
        </button>
        <button
          className={`tab-button ${activeTab === "view" ? "active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          📋 Ver Pautas
        </button>
        <button
          className={`tab-button ${activeTab === "view-evaluations" ? "active" : ""}`}
          onClick={() => setActiveTab("view-evaluations")}
        >
          🧾 Ver Evaluaciones
        </button>
        <button
          className={`tab-button ${activeTab === "evaluate" ? "active" : ""}`}
          onClick={() => setActiveTab("evaluate")}
        >
          ✍️ Evaluar Estudiante
        </button>
      </div>

      <div className="evaluations-content">
        {renderContent()}
      </div>
    </div>
  );
}