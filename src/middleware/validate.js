const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_STRENGTH = {
  minLength: PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
};

function validatePasswordStrength(password) {
  const errors = [];
  if (password.length < PASSWORD_STRENGTH.minLength) {
    errors.push(`Password must be at least ${PASSWORD_STRENGTH.minLength} characters`);
  }
  if (PASSWORD_STRENGTH.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (PASSWORD_STRENGTH.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (PASSWORD_STRENGTH.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  return errors;
}

function validateSignUp(req, res, next) {
  const { email, password, fullName } = req.body || {};
  const errors = [];

  if (email === undefined || email === null || String(email).trim() === '') {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(String(email).trim())) {
    errors.push('Email must be a valid email address');
  }

  if (fullName === undefined || fullName === null || String(fullName).trim() === '') {
    errors.push('Full name is required');
  } else if (String(fullName).trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  if (password === undefined || password === null) {
    errors.push('Password is required');
  } else {
    errors.push(...validatePasswordStrength(String(password)));
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.validated = {
    email: String(email).trim().toLowerCase(),
    password: String(password),
    fullName: String(fullName).trim(),
  };
  next();
}

function validateSignIn(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  if (email === undefined || email === null || String(email).trim() === '') {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(String(email).trim())) {
    errors.push('Email must be a valid email address');
  }

  if (password === undefined || password === null || String(password) === '') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.validated = {
    email: String(email).trim().toLowerCase(),
    password: String(password),
  };
  next();
}

module.exports = {
  validateSignUp,
  validateSignIn,
  validatePasswordStrength,
  EMAIL_REGEX,
};
