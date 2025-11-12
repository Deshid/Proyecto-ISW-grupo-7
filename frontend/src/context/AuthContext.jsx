import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    // Dev-only: remove stale or legacy session entries that can cause incorrect role checks
    if (import.meta.env.DEV) {
        const raw = sessionStorage.getItem('usuario');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                const validRoles = ['administrador', 'profesor', 'estudiante'];
                // If role is missing, malformed, or the legacy 'usuario', remove it to force a fresh login
                if (!parsed || !parsed.rol || !validRoles.includes(parsed.rol) || parsed.rol === 'usuario') {
                    sessionStorage.removeItem('usuario');
                }
            } catch (e) {
                sessionStorage.removeItem('usuario');
            }
        }
    }

    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const isAuthenticated = user ? true : false;

useEffect(() => {
    if (!isAuthenticated) {
        navigate('/auth');
    }
}, [isAuthenticated, navigate]);

return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
        {children}
    </AuthContext.Provider>
);
}