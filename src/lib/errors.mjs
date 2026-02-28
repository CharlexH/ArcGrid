export class ApiFailure extends Error {
  constructor(status, errorCode, errorMessage) {
    super(errorMessage);
    this.name = "ApiFailure";
    this.status = status;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }

  toJSON() {
    return {
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
    };
  }
}
