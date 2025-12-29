import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@components/Sidebar';
import { AuthProvider } from '@context/AuthContext';

function Root()  {
return (
    <AuthProvider>
        <PageRoot/>
    </AuthProvider>
);
}

function PageRoot() {
    const location = useLocation();
        const [sidebarOpen, setSidebarOpen] = useState(false);
    const hidenNavbarPaths = ['/auth', '/register'];
    const shouldShowNavbar = !hidenNavbarPaths.includes(location.pathname);
    
return (
    <>
                {shouldShowNavbar && (
                    <>
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                        <button
                            type="button"
                            aria-label="Abrir menú"
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                            <span>Menú</span>
                        </button>
                    </>
                )}
                <div className={shouldShowNavbar ? 'app-content has-sidebar' : 'app-content'}>
            <Outlet />
        </div>
    </>
);
}

export default Root;