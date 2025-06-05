import { errorMessages } from '~/resources';

type ErrorCode = keyof typeof errorMessages;

export function getErrorMessage(error?: unknown) {
	return error instanceof ApplicationError ? errorMessages[error.code] : errorMessages.UNDEFINED;
}

export class ApplicationError extends Error {
	code: ErrorCode;

	constructor(message: string, code?: ErrorCode) {
		super(message);

		this.code = code ?? 'UNDEFINED';
	}
}
