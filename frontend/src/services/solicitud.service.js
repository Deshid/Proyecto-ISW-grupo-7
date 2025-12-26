import api from './root.service.js';

export const createSolicitud = async (formData) => {
  // formData should be an instance of FormData when containing files
  // Let the browser set Content-Type (including boundary) for multipart requests
  const res = await api.post('/solicitud', formData, {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
};

export const getSolicitudesAlumno = async () => {
  const res = await api.get('/solicitud/student');
  return res.data;
};

export const getSolicitudesProfesor = async () => {
  const res = await api.get('/solicitud/profesor');
  return res.data;
};

export const updateSolicitudEstado = async (id, payload) => {
  const res = await api.patch(`/solicitud/${id}`, payload);
  return res.data;
};

export const getEvaluacionesEstudiante = async () => {
  const res = await api.get('/solicitud/evaluaciones');
  return res.data;
};

export const getPautas = async () => {
  const res = await api.get('/solicitud/pautas');
  return res.data;
};
