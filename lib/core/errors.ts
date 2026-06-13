/**
 * Application error hierarchy.
 *
 * Services and providers throw these typed errors; HTTP/worker boundaries map
 * them to status codes / retry decisions. Keeps business logic free of
 * transport concerns (Single Responsibility).
 */

export abstract class AppError extends Error {
  /** Machine-readable code, e.g. "NOT_FOUND". */
  abstract readonly code: string;
  /** Suggested HTTP status when surfaced over HTTP. */
  abstract readonly httpStatus: number;

  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;
}

export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly httpStatus = 422;
}

export class UnauthorizedError extends AppError {
  readonly code = "UNAUTHORIZED";
  readonly httpStatus = 401;
}

export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";
  readonly httpStatus = 403;
}

export class RateLimitedError extends AppError {
  readonly code = "RATE_LIMITED";
  readonly httpStatus = 429;
}

/** Failure talking to an external dependency (DB, Redis, third-party API). */
export class DependencyError extends AppError {
  readonly code = "DEPENDENCY_ERROR";
  readonly httpStatus = 503;
}
