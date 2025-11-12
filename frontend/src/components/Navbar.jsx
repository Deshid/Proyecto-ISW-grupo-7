import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;
    const [menuOpen, setMenuOpen] = useState(false);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth'); 
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <nav className="navbar">
            <div className={`nav-menu ${menuOpen ? 'activado' : ''}`}>
                <ul>
                    <li>
                        <NavLink 
                            to="/home" 
                            onClick={() => setMenuOpen(false)} 
                            className={({ isActive }) => isActive ? 'active' : ''}
                        >
                            Inicio
                        </NavLink>
                    </li>

                    {userRole === 'administrador' && (
                        <li>
                            <NavLink 
                                to="/users" 
                                onClick={() => setMenuOpen(false)} 
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                Usuarios
                            </NavLink>
                        </li>
                    )}
                    {(userRole === 'administrador' || userRole === 'profesor') && (
                    <li>
                        <NavLink 
                            to="/comisiones" 
                            onClick={() => { 
                                setMenuOpen(false); 
                                addActiveClass();
                            }} 
                            activeClassName="active"
                        >
                            Comisiones
                        </NavLink>
                    </li>
                    )}

                    {(userRole === 'usuario' || userRole === 'estudiante') && (
                        <li>
                            <NavLink 
                                to="/solicitud" 
                                onClick={() => setMenuOpen(false)} 
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                Solicitar Revisión/Recuperación
                            </NavLink>
                        </li>
                    )}

                    {userRole === 'profesor' && (
                        <li>
                            <NavLink 
                                to="/solicitudes" 
                                onClick={() => setMenuOpen(false)} 
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                Ver Solicitudes Revisión/Recuperación
                            </NavLink>
                        </li>
                    )}

                    <li>
                        <NavLink 
                            to="/auth" 
                            onClick={() => { 
                                logoutSubmit(); 
                                setMenuOpen(false); 
                            }} 
                            className={({ isActive }) => isActive ? 'active' : ''}
                        >
                            Cerrar sesión
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="hamburger" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
        </nav>
    );
};

export default Navbar;
