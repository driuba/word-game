import { errorMessages } from '~/resources/index.mjs';

type ErrorCode = keyof typeof errorMessages;
type ErrorData = Record<string, unknown>;

export function getErrorMessage(error?: unknown) {
	return error instanceof ApplicationError ? errorMessages[error.code] : errorMessages.UNDEFINED;
}

export class ApplicationError extends Error {
	readonly code: ErrorCode = 'UNDEFINED';
	readonly data?: ErrorData;

	constructor(message: string, value?: ErrorCode | ErrorData);
	constructor(message: string, code: ErrorCode, data?: ErrorData);
	constructor(message: string, value1?: ErrorCode | ErrorData, value2?: ErrorData) {
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

const errorCodes = new Set(Object.keys(errorMessages));

function isErrorCode(value: unknown): value is ErrorCode {
	return typeof value === 'string' && errorCodes.has(value);
}
