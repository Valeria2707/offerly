const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
// Digits, spaces, dashes and brackets only, so dates like 01.2020 stay untouched.
const PHONE = /\+?\d[\d\s()-]{8,}\d/g;
const MIN_PHONE_DIGITS = 10;

export interface AnonymizedText {
  text: string;
  emails: string[];
  phones: string[];
}

export function anonymize(text: string): AnonymizedText {
  const emails: string[] = [];
  const phones: string[] = [];
  const result = text
    .replace(EMAIL, (email) => {
      emails.push(email);
      return '[email]';
    })
    .replace(PHONE, (phone) => {
      if (phone.replace(/\D/g, '').length < MIN_PHONE_DIGITS) return phone;
      phones.push(phone.trim());
      return '[phone]';
    });
  return { text: result, emails, phones };
}
