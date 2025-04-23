// Clase base para errores HTTP
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational; // Errores esperados vs. bugs
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(400, message);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(404, message);
    }
}

// Añade más clases de error según necesites (ConflictError - 409, etc.) 