/**
 * Security utility functions for header sanitization and data validation.
 */

/**
 * Strips \r and \n characters from strings to prevent HTTP Header Injection (CRLF).
 * @param value The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeHeader(value: string): string {
    if (!value) return "";
    return value.replace(/[\r\n]/g, "");
}
