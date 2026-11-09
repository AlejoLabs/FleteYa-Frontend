import { t } from "../../i18n";

interface ErrorResponse {
    statusCode: number,
    error?: string,
    message: string | string[],
    // Distingue casos con el mismo estado HTTP; por ejemplo LINK_REQUIRED al entrar con Google
    code?: string,
    // Código del mensaje: el servidor lo manda junto con el texto en español y la app lo traduce
    key?: string,
    params?: Record<string, unknown>
}

// Los servicios la devuelven cuando la petición no tuvo respuesta: sin internet, servidor caído o se cortó la conexión.
// El mensaje se pide al leerlo, así sale en el idioma que la persona tenga en ese momento
const defaultErrorResponse: ErrorResponse = {
    statusCode: 500,
    error: 'NETWORK_ERROR',
    get message() { return t('errors.NETWORK_ERROR'); }
}

export {ErrorResponse, defaultErrorResponse};
