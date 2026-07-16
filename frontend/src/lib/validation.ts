const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&._#-]{8,}$/;

export type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function validateAuthFields(
  email: string,
  password: string,
  confirmPassword?: string
): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (!PASSWORD_PATTERN.test(password)) {
    errors.password = "Use at least 8 characters with letters and numbers.";
  }

  if (confirmPassword !== undefined) {
    if (!confirmPassword) {
      errors.confirmPassword = "Confirm your password.";
    } else if (password && confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
    }
  }

  return errors;
}
