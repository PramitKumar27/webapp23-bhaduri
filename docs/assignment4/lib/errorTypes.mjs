class NoConstraintViolation extends Error {
  constructor(message) {
    super(message);
    this.name = "NoConstraintViolation";
  }
}

class MandatoryValueConstraintViolation extends Error {
  constructor(message) {
    super(message);
    this.name = "MandatoryValueConstraintViolation";
  }
}

class RangeConstraintViolation extends Error {
  constructor(message) {
    super(message);
    this.name = "RangeConstraintViolation";
  }
}

class UniquenessConstraintViolation extends Error {
  constructor(message) {
    super(message);
    this.name = "UniquenessConstraintViolation";
  }
}

class StringLenghtConstrainViolation extends Error {
  constructor(message) {
    super(message);
    this.name = "StringLenghtConstrainViolation";
  }
}

class IntervalConstraintViolation extends Error {
  constructor(message) {
    super(message);
    this.name = "IntervalConstraintViolation";
  }
}

class ReferentialIntegrityConstraintViolation extends Error {
  constructor (msg) {
    super( msg);
    this.name = "ReferentialIntegrityConstraintViolation";
  }
}

export { NoConstraintViolation, 
  MandatoryValueConstraintViolation, 
  RangeConstraintViolation,
  UniquenessConstraintViolation,
  StringLenghtConstrainViolation,
  IntervalConstraintViolation,
  ReferentialIntegrityConstraintViolation};