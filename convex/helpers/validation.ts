/**
 * Validation Helpers
 *
 * Pure functions for input validation.
 * NO database access, NO ctx parameter.
 *
 * These helpers are used by the endpoint layer to validate user input
 * before passing it to the database layer.
 */

/**
 * Validate task title
 * - Must not be empty
 * - Must not exceed 200 characters
 * - Must not be only whitespace
 */
export function isValidTaskTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 200;
}

/**
 * Validate task description (optional field)
 * - Can be empty/undefined
 * - If provided, must not exceed 2000 characters
 */
export function isValidTaskDescription(
  description: string | undefined
): boolean {
  if (description === undefined) {
    return true;
  }
  return description.length <= 2000;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least one letter and one number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasLetter && hasNumber;
}

/**
 * Sanitize string input
 * - Trims whitespace
 * - Removes null bytes
 * - Limits length
 */
export function sanitizeString(
  input: string,
  maxLength: number = 1000
): string {
  return input
    .replace(/\0/g, "") // Remove null bytes
    .trim()
    .slice(0, maxLength);
}

/**
 * Validation error messages
 */
export const ValidationErrors = {
  TASK_TITLE_EMPTY: "Task title cannot be empty",
  TASK_TITLE_TOO_LONG: "Task title must be 200 characters or less",
  TASK_DESCRIPTION_TOO_LONG: "Task description must be 2000 characters or less",
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD:
    "Password must be at least 8 characters with letters and numbers",
} as const;
