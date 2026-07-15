const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com',
  'grr.la', 'spam4.me', 'trashmail.com', 'trashmail.me', 'trashmail.at',
  'trashmail.io', 'trashmail.net', 'trashmail.org', 'trashmail.app', 'trashmail.xyz',
  'trashmailer.com', 'yopmail.com', 'yopmail.fr', 'fakeinbox.com', 'mailnull.com',
  'maildrop.cc', 'getairmail.com', 'dispostable.com', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org', 'tempr.email', 'discard.email',
  'rcpt.at', 'mailboxy.fun', 'tempinbox.com', 'getnada.com', 'mailnesia.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.co.uk',
  '10minutemail.de', '10minutemail.pl', '10minutemail.info',
  'temp-mail.org', 'emailondeck.com', 'burnermail.io', 'throwaway.email',
  'harakirimail.com', 'mailtemp.info', 'fakemailgenerator.com', 'throwam.com',
  'spamobox.com', 'mintemail.com', 'filzmail.com', 'tempmail.com',
  'fakemail.net', 'deagot.com', 'bametv.com', 'mailme.gq',
  'spamfree24.org', 'spamgob.com', 'mailforspam.com', 'dodgeit.com',
  'anonbox.net', 'maileater.com', 'ownmail.net', 'nwldx.com',
  'trbvm.com', 'trbvn.com', 'tilen.com', 'temporaryemail.net',
  'anonymousemail.me', 'wmail.cf', 'spam.la', 'mailnow.net',
  'temporarymail.net', 'mailbolt.com', 'lol.ovpn.to',
  'mailforspam.com', 'spamhereplease.com', 'spamoverlord.com',
  'guerrillamailblock.com', 'notmailinator.com', 'binkmail.com',
  'hoonmail.com', 'vomoto.com', 'smellfear.com', 'tafmail.com',
  'tradermail.info', 'fakemailgenerator.com', 'mailtemp.info',
]);

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'yahoo.co.uk', 'yahoo.co.id',
  'yahoo.co.jp', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.in', 'hotmail.fr', 'hotmail.de',
  'outlook.com', 'outlook.in', 'live.com', 'msn.com', 'aol.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'pm.me', 'proton.me',
  'tutanota.com', 'tutanota.de', 'tuta.io',
  'zoho.com', 'rediffmail.com',
  'yandex.com', 'yandex.ru',
  'mail.com', 'inbox.com', 'fastmail.com',
  'gmx.com', 'gmx.net', 'gmx.de', 'web.de',
  'mail.ru', 'list.ru', 'bk.ru', 'inbox.ru',
  'rocketmail.com', 'googlemail.com',
]);

const SPAM_KEYWORDS = [
  'casino', 'free money', 'earn $', 'click here', 'buy now', 'limited offer',
  'you have won', 'congratulations you', 'xxx', 'porn', 'adult content',
  'cheap meds', 'make money fast', 'work from home',
  'network marketing', 'pyramid scheme', 'bitcoin investment',
  'crypto investment', 'double your money', 'you are a winner',
  'jackpot', 'lottery winner', 'claim your prize', 'act now',
];

const FAKE_NAME_PATTERNS = [
  /^(test|testing|user|admin|demo|sample|example|fake|asdf|qwerty|aaa|bbb|ccc|xxx|yyy|zzz|abc|xyz|foo|bar|baz|john doe|jane doe|first last|n\/a|na|null|undefined|none|no name|anonymous|hello|temp|random)$/i,
  /^(.)\1{3,}$/i,
  /^[a-z]{1,2}$/i,
  /^\d+$/,
];

export type LeadStatus = 'valid' | 'suspicious' | 'rejected';

export interface LeadValidationResult {
  status: LeadStatus;
  score: number;
  reasons: string[];
}

export interface ValidateLeadInput {
  email: string;
  name: string;
  message?: string;
  phone?: string;
  company?: string;
  recaptchaToken?: string;
  formStartTime?: number;
}

function getEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase().trim() ?? '';
}

function isDisposableEmail(email: string): boolean {
  return DISPOSABLE_DOMAINS.has(getEmailDomain(email));
}

function isCompanyEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  return !FREE_EMAIL_DOMAINS.has(domain) && !DISPOSABLE_DOMAINS.has(domain);
}

function isValidPhone(phone?: string): boolean {
  if (!phone || phone.trim().length === 0) return false;
  const digits = phone.replace(/[\s\-+().]/g, '');
  if (digits.length < 7 || digits.length > 15) return false;
  if (/^(\d)\1{6,}$/.test(digits)) return false;
  if (/^(0{7,}|1234567|1234567890)/.test(digits)) return false;
  return true;
}

function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  return !FAKE_NAME_PATTERNS.some(p => p.test(trimmed));
}

function checkMessage(message: string): { quality: boolean; hasSpam: boolean } {
  const m = message.trim().toLowerCase();
  const hasSpam = SPAM_KEYWORDS.some(kw => m.includes(kw));
  return { quality: message.trim().length >= 20, hasSpam };
}

async function fetchRecaptchaScore(token: string): Promise<number> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return 0.5;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json() as { success: boolean; score?: number };
    return data.success ? (data.score ?? 0.5) : 0.1;
  } catch {
    return 0.5;
  }
}

export async function validateLead(input: ValidateLeadInput): Promise<LeadValidationResult> {
  const reasons: string[] = [];
  let score = 0;

  // Hard reject: disposable email domain
  if (isDisposableEmail(input.email)) {
    return { status: 'rejected', score: -50, reasons: ['Disposable email domain'] };
  }

  // +30 company / work email
  if (isCompanyEmail(input.email)) {
    score += 30;
  } else {
    reasons.push('Free email provider (not a work email)');
  }

  // -25 fake/bot name
  if (!isValidName(input.name)) {
    score -= 25;
    reasons.push('Suspicious or fake name');
  }

  // +20 quality message  /  -30 spam keywords
  if (input.message) {
    const { quality, hasSpam } = checkMessage(input.message);
    if (quality && !hasSpam) score += 20;
    if (hasSpam) { score -= 30; reasons.push('Spam keywords in message'); }
    if (!quality) reasons.push('Message too short');
  }

  // +20 valid phone
  if (isValidPhone(input.phone)) {
    score += 20;
  }

  // +15 real company name
  if (input.company) {
    const co = input.company.trim().toLowerCase();
    const isFake = ['test', 'n/a', 'na', 'none', 'company', 'abc', 'xyz', 'asdf', 'no'].includes(co);
    if (!isFake && co.length > 2) {
      score += 15;
    } else {
      score -= 10;
      reasons.push('Suspicious company name');
    }
  }

  // -30 submitted too fast  /  +5 genuine human time
  if (input.formStartTime) {
    const elapsed = Date.now() - input.formStartTime;
    if (elapsed < 5000) {
      score -= 30;
      reasons.push('Form submitted too fast (< 5 seconds — bot-like)');
    } else if (elapsed > 15000) {
      score += 5;
    }
  }

  // reCAPTCHA v3 score
  const captchaScore = await fetchRecaptchaScore(input.recaptchaToken ?? '');
  if (captchaScore >= 0.7) {
    score += 10;
  } else if (captchaScore < 0.3) {
    score -= 20;
    reasons.push(`Low reCAPTCHA score (${captchaScore.toFixed(2)})`);
  } else if (captchaScore < 0.5) {
    score -= 10;
    reasons.push(`Moderate reCAPTCHA score (${captchaScore.toFixed(2)})`);
  }

  let status: LeadStatus;
  if (score >= 50) status = 'valid';
  else if (score >= 20) status = 'suspicious';
  else status = 'rejected';

  return { status, score, reasons };
}
