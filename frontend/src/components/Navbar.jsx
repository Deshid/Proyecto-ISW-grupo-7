import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

     const menuItems = [
        { path: '/home', label: '🏠 Inicio', roles: ['administrador', 'profesor', 'estudiante', 'usuario'] },
        { path: '/users', label: '👥 Usuarios', roles: ['administrador'] },
        { path: '/evaluations', label: '📝 Evaluaciones', roles: ['profesor'] },
        { path: '/comisiones', label: '📅 Comisiones', roles: ['administrador', 'profesor'] },
        { path: '/solicitud', label: '📋 Solicitar Revisión/Recuperación', roles: ['usuario', 'estudiante'] },
        { path: '/solicitudes', label: '📂 Ver Solicitudes', roles: ['profesor'] },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Menú</h3>
                {user?.nombreCompleto && <p>{user.nombreCompleto}</p>}
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map(item => (
                        item.roles.includes(userRole) && (
                            <li key={item.path}>
                                <NavLink to={item.path}>
                                    {item.label}
                                </NavLink>
                            </li>
                        )
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/auth" onClick={handleLogout}>
                    🚪 Cerrar sesión
                </NavLink>
            </div>
        </div>
    );
};

export default Navbar;