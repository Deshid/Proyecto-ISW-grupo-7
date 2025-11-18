import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@components/Navbar';
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
        {shouldShowNavbar && <Navbar />}
        <div style={{ marginLeft: shouldShowNavbar ? '250px' : '0', minHeight: '100vh' }}>
            <Outlet />
        </div>
    </>
);
}

export default Root;