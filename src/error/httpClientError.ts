export class HttpClientError extends Error {
  public httpCode: number;
  public error_message: string;
  public error_code: string;
  public isOperational: boolean;
  constructor(httpCode: number, error_messsge: string, error_code: string) {
    super(error_messsge);
    this.httpCode = httpCode;
    this.error_message = error_messsge;
    this.error_code = error_code;
    this.isOperational = true;
  }
}

export class BadRequest extends HttpClientError {
  constructor(customMessage: string = "Bad Request") {
    super(400, customMessage, "BAD_REQUEST");
  }
}

export class Unauthorized extends HttpClientError {
  constructor(
    customMessage: string = "Unauthorized",
    error_code: string = "UNAUTHORIZED",
  ) {
    super(401, customMessage, error_code);
  }
}

export class Forbidden extends HttpClientError {
  constructor(customMessage: string = "Forbidden") {
    super(403, customMessage, "FORBIDDEN");
  }
}

export class NotFound extends HttpClientError {
  constructor(
    customMessage: string = "Data Not Found",
    error_code: string = "DATA_NOT_FOUND",
  ) {
    super(404, customMessage, error_code);
  }
}

export class MethodNotAllowed extends HttpClientError {
  constructor(customMessage: string = "Method Not Allowed") {
    super(405, customMessage, "METHOD_NOT_ALLOWED");
  }
}

export class Conflict extends HttpClientError {
  constructor(
    customMessage: string = "Conflict",
    error_code: string = "CONFLICT",
  ) {
    super(409, customMessage, error_code);
  }
}

export class UnprocessableEntity extends HttpClientError {
  constructor(customMessage: string = "Unprocessable Entity") {
    super(422, customMessage, "UNPROCESSABLE_ENTITY");
  }
}

export class TooManyRequests extends HttpClientError {
  constructor(customMessage: string = "Too Many Requests") {
    super(429, customMessage, "TOO_MANY_REQUESTS");
  }
}
