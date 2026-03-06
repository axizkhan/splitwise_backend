export class HttpServerError extends Error {
  public statusCode: number;
  public errorMessage: string;
  public errorCode: string;
  public isOperational: boolean;
  constructor(statusCode: number, errorMessage: string, errorCode: string) {
    super(errorMessage);
    this.statusCode = statusCode;
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
    this.isOperational = true;
  }
}

export class InternalServerError extends HttpServerError {
  constructor(errorMessage: string = "Internal Server Error") {
    super(500, errorMessage, "INTERNAL_SERVER_ERROR");
  }
}

export class NotImplemented extends HttpServerError {
  constructor(errorMessage: string = "Not Implemented") {
    super(501, errorMessage, "NOT_IMPLEMENTED");
  }
}

export class BadGateway extends HttpServerError {
  constructor(errorMessage: string = "Bad Gateway") {
    super(502, errorMessage, "BAD_GATEWAY");
  }
}

export class ServiceUnavailable extends HttpServerError {
  constructor(errorMessage: string = "Service Unavailable") {
    super(503, errorMessage, "SERVICE_UNAVAILABLE");
  }
}

export class GatewayTimeout extends HttpServerError {
  constructor(errorMessage: string = "Gateway Timeout") {
    super(504, errorMessage, "GATEWAY_TIMEOUT");
  }
}
