export const errorCodes = {
  userInvalid: 'USER_INVALID',
  wordInvalid: 'WORD_INVALID'
} as const;

type ErrorCode = typeof errorCodes[keyof typeof errorCodes];

export class ApplicationError extends Error {
  code?: ErrorCode | null;

  constructor(message: string, code?: ErrorCode) {
    super(message);

    this.code = code;
  }
}
