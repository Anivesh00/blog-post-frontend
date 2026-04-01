/**
 * Client-side validation (mirrors backend rules)
 */

export const VALIDATION = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    specialChars: '!@#$%^&*',
    message: 'Password must be 8+ chars with uppercase, lowercase, number, and special char (!@#$%^&*)'
  },
  username: {
    minLength: 3,
    maxLength: 30,
    regex: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3–30 chars, alphanumeric + underscore only'
  },
  title: {
    minLength: 5,
    maxLength: 200,
    message: 'Title must be 5–200 characters'
  },
  content: {
    minLength: 10,
    maxLength: 10000,
    message: 'Content must be 10–10000 characters'
  },
  excerpt: {
    maxLength: 500,
    message: 'Excerpt must be 0–500 characters'
  },
  comment: {
    minLength: 1,
    maxLength: 2000,
    message: 'Comment must be 1–2000 characters'
  },
  tags: {
    maxTags: 10,
    minLength: 2,
    maxLength: 50,
    message: 'Tags: 0–10 tags, each 2–50 chars'
  }
};

export function isValidEmail(email: string): boolean {
  return VALIDATION.email.regex.test(email);
}

export function isValidPassword(password: string): boolean {
  if (password.length < VALIDATION.password.minLength || password.length > VALIDATION.password.maxLength) return false;
  if (VALIDATION.password.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (VALIDATION.password.requireLowercase && !/[a-z]/.test(password)) return false;
  if (VALIDATION.password.requireNumber && !/[0-9]/.test(password)) return false;
  if (VALIDATION.password.requireSpecial && !new RegExp(`[${VALIDATION.password.specialChars}]`).test(password)) return false;
  return true;
}

export function isValidUsername(username: string): boolean {
  return username.length >= VALIDATION.username.minLength &&
    username.length <= VALIDATION.username.maxLength &&
    VALIDATION.username.regex.test(username);
}

export function isValidTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length >= VALIDATION.title.minLength && trimmed.length <= VALIDATION.title.maxLength;
}

export function isValidContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.length >= VALIDATION.content.minLength && trimmed.length <= VALIDATION.content.maxLength;
}

export function isValidExcerpt(excerpt: string): boolean {
  if (!excerpt) return true; // optional
  return excerpt.trim().length <= VALIDATION.excerpt.maxLength;
}

export function isValidComment(comment: string): boolean {
  const trimmed = comment.trim();
  return trimmed.length >= VALIDATION.comment.minLength && trimmed.length <= VALIDATION.comment.maxLength;
}

export function isValidTags(tags: string[]): boolean {
  if (!tags) return true; // optional
  if (tags.length > VALIDATION.tags.maxTags) return false;
  return tags.every(tag => {
    const trimmed = tag.trim();
    return trimmed.length >= VALIDATION.tags.minLength && trimmed.length <= VALIDATION.tags.maxLength;
  });
}
