interface ErrorResponse {
    statusCode: number,
    error?: string,
    message: string | string[]
}

const defaultErrorResponse: ErrorResponse = {
    statusCode: 500,
    error: 'Error desconocido',
    message: 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo más tarde.'
}

export {ErrorResponse, defaultErrorResponse};