import { errorMessages } from '~/resources';

export function getErrorMessage(error?: unknown) {
	return error instanceof ApplicationError ? errorMessages[error.code] : errorMessages.UNDEFINED;
}

export class ApplicationError extends Error {
	readonly code: ErrorCode = 'UNDEFINED';
	readonly data?: object;

	constructor(message: string, value?: ErrorCode | object);
	constructor(message: string, code: ErrorCode, data?: object);
	constructor(message: string, value1?: ErrorCode | object, value2?: object) {
		super(message);

		if (isErrorCode(value1)) {
			this.code = value1;

			if (value2) {
				this.data = value2;
			}
		} else if (value1) {
			this.data = value1;
		}
	}
}

type ErrorCode = keyof typeof errorMessages;

const errorCodes = new Set(Object.keys(errorMessages));

function isErrorCode(value: unknown): value is ErrorCode {
	return typeof value === 'string' && errorCodes.has(value);
}
