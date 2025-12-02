import { Outlet, useLocation } from 'react-router-dom';
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
    const hidenNavbarPaths = ['/auth', '/register'];
    const shouldShowNavbar = !hidenNavbarPaths.includes(location.pathname);
    
return (
    <>
        {shouldShowNavbar && <Sidebar />}
        <div style={{ marginLeft: shouldShowNavbar ? '250px' : '0', minHeight: '100vh' }}>
            <Outlet />
        </div>
    </>
);
}

export default Root;