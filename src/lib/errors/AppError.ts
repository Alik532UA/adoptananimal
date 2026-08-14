/**
 * Base class for all application-specific errors.
 */
export class AppError extends Error {
	constructor(
		public readonly code: string,
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, AppError.prototype);
	}
}

/**
 * Error thrown when a resource is not found.
 */
export class NotFoundError extends AppError {
	constructor(resource: string) {
		super('NOT_FOUND', `${resource} not found`);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends AppError {
	constructor(public readonly fields: Record<string, string>) {
		super('VALIDATION_ERROR', 'Invalid data provided');
		Object.setPrototypeOf(this, ValidationError.prototype);
	}
}

/**
 * Error thrown during storage operations (localStorage).
 */
export class StorageError extends AppError {
	constructor(message: string, cause?: unknown) {
		super('STORAGE_ERROR', message, cause);
		Object.setPrototypeOf(this, StorageError.prototype);
	}
}
