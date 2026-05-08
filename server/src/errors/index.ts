class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

class UnauthorizedError extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

class DBConstraintError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "DBConstraintError";
  }
}

class BadRequestError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export {
  NotFoundError,
  UnauthorizedError,
  DBConstraintError,
  BadRequestError,
};
