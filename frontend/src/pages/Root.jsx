import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@components/Navbar';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { useEffect, useState } from 'react';

function Root()  {
    return (
            <AuthProvider>
                    <PageRoot/>
            </AuthProvider>
    );
}

function DebugPanel() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [userStr, setUserStr] = useState('');

    useEffect(() => {
        setUserStr(window.sessionStorage.getItem('usuario') || 'null');
    }, [isAuthenticated, location]);

    return (
        <div style={{position: 'fixed', right: 8, bottom: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: 8, borderRadius: 6, zIndex:9999, fontSize:12}}>
            <div><strong>DEBUG</strong></div>
            <div>auth: {String(isAuthenticated)}</div>
            <div>location: {location.pathname}</div>
            <div>usuario: {userStr}</div>
        </div>
    );
}

function PageRoot() {
    return (
            <>
                    <Navbar />
                    <Outlet />
                    <DebugPanel />
            </>
    );
}

export default Root;