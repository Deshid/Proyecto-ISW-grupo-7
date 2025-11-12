import axios from './root.service.js';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { convertirMinusculas } from '@helpers/formatData.js';

export async function login(dataUser) {
    try {
        const response = await axios.post('/auth/login', {
            email: dataUser.email, 
            password: dataUser.password
        });
        const { status, data } = response;
    if (status === 200) {
        // Safely extract token (response shape: { status, message, data: { token } })
        const token = data && data.data && data.data.token ? data.data.token : null;
        if (!token) return { status: 'error', message: 'Token no encontrado en la respuesta' };

        // Decode token and store consistent fields (backend payload uses 'nombre' and 'rol')
        const payload = jwtDecode(token);
        const nombre = payload?.nombre || payload?.nombreCompleto || '';
        const email = payload?.email || '';
        const rol = payload?.rol || '';
        const userData = { nombre, email, rol };

        // Overwrite any existing session info with the newly decoded user
        sessionStorage.setItem('usuario', JSON.stringify(userData));

        // set axios default header and cookie for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        cookies.set('jwt-auth', token, { path: '/' });
        return response.data;
    }
    } catch (error) {
        return error.response.data;
    }
}

export async function register(data) {
    try {
        const dataRegister = convertirMinusculas(data);
        const { nombreCompleto, email, rut, password } = dataRegister
        const response = await axios.post('/auth/register', {
            nombreCompleto,
            email,
            rut,
            password
        });
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function logout() {
    try {
        await axios.post('/auth/logout');
        sessionStorage.removeItem('usuario');
        cookies.remove('jwt');
        cookies.remove('jwt-auth');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}