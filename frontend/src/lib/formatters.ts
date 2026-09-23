/**
 * User Identity and Name Formatting Utilities.
 *
 * WHAT IT IS:
 *   Transforms raw usernames, email handles, or database identifiers
 *   (e.g. 'gagan_paul_v', 'john.doe', 'gagan23211') into elegant,
 *   properly capitalized human names and warm greeting messages.
 */

export interface FormattedUserName {
  firstName: string;
  fullName: string;
  greeting: string;
}

export function formatUserName(user?: {
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
} | null): FormattedUserName {
  if (!user) {
    return {
      firstName: 'Student',
      fullName: 'Student',
      greeting: 'Welcome back, Student!',
    };
  }

  // Determine candidate raw string
  let raw = user.full_name?.trim() || user.username?.trim() || '';

  // If candidate is empty or an email, use the local part
  if (!raw && user.email) {
    raw = user.email.split('@')[0];
  } else if (raw.includes('@')) {
    raw = raw.split('@')[0];
  }

  if (!raw) {
    return {
      firstName: 'Student',
      fullName: 'Student',
      greeting: 'Welcome back, Student!',
    };
  }

  // Replace underscores, dots, hyphens with spaces
  const cleaned = raw.replace(/[_\.\-]+/g, ' ').trim();

  // Tokenize words
  const words = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      // If word has digits at the end (like gagan23211), strip digits if letters exist
      const strippedDigits = word.replace(/\d+$/, '');
      const target = strippedDigits.length >= 2 ? strippedDigits : word;
      if (target.length === 1) return target.toUpperCase();
      return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
    });

  if (words.length === 0) {
    return {
      firstName: 'Student',
      fullName: 'Student',
      greeting: 'Welcome back, Student!',
    };
  }

  const firstName = words[0];
  const fullName = words.join(' ');

  return {
    firstName,
    fullName,
    greeting: `Welcome back, ${firstName}!`,
  };
}

/**
 * Formats a plain string name or username into Title Case with spaces.
 */
export function formatDisplayName(rawName?: string | null): string {
  if (!rawName) return 'Student';
  return formatUserName({ full_name: rawName }).fullName;
}
