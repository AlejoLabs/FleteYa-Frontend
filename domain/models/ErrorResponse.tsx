interface ErrorResponse {
    statusCode: number,
    error?: string,
    message: string | string[],
    // Distingue casos con el mismo estado HTTP; por ejemplo LINK_REQUIRED al entrar con Google
    code?: string
}

const defaultErrorResponse: ErrorResponse = {
    statusCode: 500,
    error: 'Error desconocido',
    message: 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo más tarde.'
}

export {ErrorResponse, defaultErrorResponse};