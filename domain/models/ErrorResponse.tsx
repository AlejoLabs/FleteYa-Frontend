interface ErrorResponse {
    statusCode: number,
    error?: string,
    message: string | string[],
    // Distingue casos con el mismo estado HTTP; por ejemplo LINK_REQUIRED al entrar con Google
    code?: string
}

// Los servicios la devuelven cuando la petición no tuvo respuesta: sin internet, servidor caído o se cortó la conexión
const defaultErrorResponse: ErrorResponse = {
    statusCode: 500,
    error: 'Sin conexión',
    message: 'No pudimos conectarnos con FleteYa. Revisa tu internet e intenta de nuevo.'
}

export {ErrorResponse, defaultErrorResponse};