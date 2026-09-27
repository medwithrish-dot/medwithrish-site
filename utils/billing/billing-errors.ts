export class BillingError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "BillingError";
    this.statusCode = statusCode;
  }
}

export class AuthenticationRequiredError extends BillingError {
  constructor(message = "Log in before proceeding.") {
    super(message, 401);
    this.name = "AuthenticationRequiredError";
  }
}

export class InvalidRequestError extends BillingError {
  constructor(message = "Invalid billing request.") {
    super(message, 400);
    this.name = "InvalidRequestError";
  }
}

export class BillingForbiddenError extends BillingError {
  constructor(message = "You do not have access to this billing resource.") {
    super(message, 403);
    this.name = "BillingForbiddenError";
  }
}

export class BillingNotFoundError extends BillingError {
  constructor(message = "Billing resource not found.") {
    super(message, 404);
    this.name = "BillingNotFoundError";
  }
}

export class BillingConflictError extends BillingError {
  constructor(message: string) {
    super(message, 409);
    this.name = "BillingConflictError";
  }
}

export class ConfigurationError extends BillingError {
  constructor(message = "Billing configuration error.") {
    super(message, 500);
    this.name = "ConfigurationError";
  }
}

export class ProviderError extends BillingError {
  constructor(message = "Provider error occurred.") {
    super(message, 500);
    this.name = "ProviderError";
  }
}

const billingErrorNames = new Set([
  "BillingError",
  "AuthenticationRequiredError",
  "InvalidRequestError",
  "BillingForbiddenError",
  "BillingNotFoundError",
  "BillingConflictError",
  "ConfigurationError",
  "ProviderError",
]);

export function isBillingError(
  error: unknown
): error is BillingError {
  return (
    error instanceof BillingError ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      typeof error.name === "string" &&
      billingErrorNames.has(error.name) &&
      "statusCode" in error &&
      typeof error.statusCode === "number" &&
      Number.isInteger(error.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode <= 599 &&
      "message" in error &&
      typeof error.message === "string")
  );
}

export function toBillingResponse(
  error: unknown,
  fallbackMessage = "Billing operation failed."
): Response {
  if (isBillingError(error)) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }

  return Response.json({ error: fallbackMessage }, { status: 500 });
}
