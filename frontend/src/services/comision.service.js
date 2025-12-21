import axios from './root.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';

/* Crear horario */
export async function createHorario(data) {
  try {
    const response = await axios.post('/horarios', data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    showErrorAlert('Error', 'No se pudo conectar con el servidor');
    return { status: 'error', message: 'Error de conexión' };
  }
}

/* Obtener lugares */
export async function getLugares() {
  try {
    const response = await axios.get('/lugares');
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener lugares:', error);
    return [];
  }
}

/* Obtener horarios por lugar */
export async function getHorariosPorLugar(id_lugar) {
  try {
    const response = await axios.get(`/horarios/lugar/${id_lugar}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return [];
  }
}

/* Asignar profesor a horario */
export async function asignarProfesorAHorario(id_horario, id_profesor) {
  try {
    const response = await axios.post(`/horarios/${id_horario}/asignar-profesor`, { id_profesor });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    showErrorAlert('Error', 'No se pudo asignar el profesor');
    return { status: 'error', message: 'Error de conexión' };
  }
}

/* Asignar estudiantes a profesor */
export async function asignarEstudiantesAProfesor(id_profesor, listaEstudiantes) {
  try {
    const response = await axios.post(`/profesor/${id_profesor}/asignar-estudiantes`, { listaEstudiantes });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    showErrorAlert('Error', 'No se pudo asignar los estudiantes');
    return { status: 'error', message: 'Error de conexión' };
  }
}

/* Obtener profesores */
export async function getProfesores() {
  try {
    const response = await axios.get('/user/');
    const users = response.data.data || [];
    return users.filter(user => user.rol === 'profesor');
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    return [];
  }
}

/* Obtener estudiantes */
export async function getEstudiantes() {
  try {
    const response = await axios.get('/user/');
    const users = response.data.data || [];
    return users.filter(user => user.rol === 'estudiante');
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    return [];
  }
}

/* Actualizar horario */
export async function actualizarHorario(id_horario, data) {
  try {
    const response = await axios.put(`/horarios/${id_horario}`, data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    showErrorAlert('Error', 'No se pudo actualizar el horario');
    return { status: 'error', message: 'Error de conexión' };
  }
}

/* Eliminar horario */
export async function eliminarHorario(id_horario) {
  try {
    const response = await axios.delete(`/horarios/${id_horario}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    showErrorAlert('Error', 'No se pudo eliminar el horario');
    return { status: 'error', message: 'Error de conexión' };
  }
}
