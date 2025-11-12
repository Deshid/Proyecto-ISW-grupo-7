import axios from './root.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';

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

export async function getLugares() {
  try {
    const response = await axios.get('/lugares');
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener lugares:', error);
    return [];
  }
}

export async function getHorariosPorLugar(id_lugar) {
  try {
    const response = await axios.get(`/horarios/lugar/${id_lugar}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return [];
  }
}
