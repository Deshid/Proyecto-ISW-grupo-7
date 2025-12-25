import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import '@styles/comisiones.css';

const ComisionesLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="comisiones-layout">
      <div className="comisiones-header">
        <div className="page-header">
          <h1 className="titulo">
            <span className="material-symbols-outlined page-icon">balance</span> 
            Gestión de Comisiones
          </h1>
          <p className="subtitulo">Administración de horarios, profesores y estudiantes</p>
        </div>

        <nav className="comisiones-nav">
          <button
            onClick={() => navigate('/comisiones/programar')}
            className={`nav-btn ${isActive('/comisiones/programar') ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">schedule</span>
            Programar Evaluación
          </button>
          <button
            onClick={() => navigate('/comisiones/profesores')}
            className={`nav-btn ${isActive('/comisiones/profesores') ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">person</span>
            Profesores
          </button>
          <button
            onClick={() => navigate('/comisiones/estudiantes')}
            className={`nav-btn ${isActive('/comisiones/estudiantes') ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">school</span>
            Estudiantes
          </button>
        </nav>
      </div>

      <div className="comisiones-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ComisionesLayout;
