import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

     const menuItems = [
        { path: '/home', label: 'Inicio', icon: 'home', roles: ['administrador', 'profesor', 'estudiante', 'usuario'] },
        { path: '/users', label: 'Usuarios', icon: 'group', roles: ['administrador'] },
        { path: '/evaluations', label: 'Evaluaciones', icon: 'assignment', roles: ['profesor'] },
        { path: '/comisiones/programar', label: 'Comisiones', icon: 'event', roles: ['administrador', 'profesor'] },
        { path: '/solicitud', label: 'Solicitar Revisión/Recuperación', icon: 'note_add', roles: ['usuario', 'estudiante'] },
        { path: '/solicitudes', label: 'Ver Solicitudes', icon: 'folder', roles: ['profesor'] },
        { path: '/asignacion', label: 'Ver Comisión Asignada', icon: 'event', roles: ['usuario', 'estudiante'] },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Menú</h3>
                {user?.nombreCompleto && <p>{user.nombreCompleto}</p>}
            </div>

            <nav className="sidebar-navegacion">
                <ul>
                    {menuItems.map(item => (
                        item.roles.includes(userRole) && (
                            <li key={item.path}>
                                <NavLink to={item.path} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                                    {item.icon && (
                                        <span className="material-symbols-outlined sidebar-icon">{item.icon}</span>
                                    )}
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        )
                    ))}
                </ul>
            </nav>

            <div className="sidebar-pie">
                <NavLink to="/auth" onClick={handleLogout}>
                    <span className="material-symbols-outlined sidebar-icon">logout</span>
                    <span>Cerrar sesión</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
