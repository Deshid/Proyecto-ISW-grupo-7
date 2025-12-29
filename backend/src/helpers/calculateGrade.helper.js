export const calculateGrade = (puntajesObtenido, puntajesMaximo, porcentajeEscala) => {
    const puntaje = Math.min(puntajesObtenido, puntajesMaximo);

    if (puntaje === 0) return 1.0;

    const porcentajeObtenido = (puntaje / puntajesMaximo) * 100;
    const puntajeAprobacion = (porcentajeEscala / 100) * puntajesMaximo;

    let nota;
    if (puntaje < puntajeAprobacion) {
        // Interpolar entre 1.0 (0 puntos) y 4.0 (puntaje aprobación)
        nota = ((4.0 - 1.0) * (puntaje - 0) / (puntajeAprobacion - 0)) + 1.0;
    } else {
        // Interpolar entre 4.0 (puntaje aprobación) y 7.0 (puntaje máximo)
        nota = ((7.0 - 4.0) * (puntaje - puntajeAprobacion) / (puntajesMaximo - puntajeAprobacion)) + 4.0;
    }

    // Redondear: truncar a 2 decimales, luego redondear el segundo hacia arriba si >= 0.05
    const notaTruncada = Math.floor(nota * 100) / 100;
    const segundoDecimal = Math.round((nota * 100) % 10);

    if (segundoDecimal >= 5) {
        return Math.ceil(nota * 10) / 10;
    }
    return Math.floor(nota * 10) / 10;
};