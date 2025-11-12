import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';
import SolicitudPage from "@pages/SolicitudPage";
import SolicitudesProfesor from '@pages/SolicitudesProfesor';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        // acceso de /home
        path: '/home',
        element: <Home/>
      },
      {
        path: '/users',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: '/solicitud',
        element: (
          <ProtectedRoute allowedRoles={['usuario', 'estudiante']}>
            <SolicitudPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/solicitudes',
        element: (
          <ProtectedRoute allowedRoles={['profesor']}>
            <SolicitudesProfesor />
          </ProtectedRoute>
        ),
      },
      // ruta catch-all dentro de Root (si quieres que el Error404 se muestre dentro del layout)
      {
        path: '*',
        element: <Error404 />
      }
    ]
  },
  // rutas fuera del layout Root
  {
    path: '/auth',
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  },
  // ruta global catch-all (por seguridad)
  {
    path: '*',
    element: <Error404 />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
);