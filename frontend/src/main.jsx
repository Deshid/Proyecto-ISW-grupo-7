import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Evaluations from '@pages/Evaluations';
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';
import '@styles/home.css';
import '@styles/home-sections.css';
import SolicitudPage from "@pages/SolicitudPage";
import SolicitudesProfesor from '@pages/SolicitudesProfesor';
import ComisionesLayout from '@pages/comisiones/ComisionesLayout';
import ProgramarEvaluacion from '@pages/comisiones/ProgramarEvaluacion';
import Profesores from '@pages/comisiones/Profesores';
import Estudiantes from '@pages/comisiones/Estudiantes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        path: 'home',
        element: <Home/>
      },
      {
        path: 'auth',
        element: <Login/>
      },
      {
        path: 'register',
        element: <Register/>
      },
      {
        path: 'evaluations',
        element: (
        <ProtectedRoute allowedRoles={['profesor']}>
          <Evaluations />
        </ProtectedRoute>
        )
      },
      {
        path: 'users',
        element: (
        <ProtectedRoute allowedRoles={['administrador']}>
          <Users />
        </ProtectedRoute>
        )
    }
    ,
    {
      path: '/comisiones',
      element: (
        <ProtectedRoute allowedRoles={['administrador','profesor']}>
          <ComisionesLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="programar" replace />
        },
        {
          path: 'programar',
          element: <ProgramarEvaluacion />
        },
        {
          path: 'profesores',
          element: <Profesores />
        },
        {
          path: 'estudiantes',
          element: <Estudiantes />
        }
      ]
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
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
)