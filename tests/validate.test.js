const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  validatePasswordStrength,
  EMAIL_REGEX,
} = require('../src/middleware/validate');

describe('Validation (unit)', () => {
  describe('EMAIL_REGEX', () => {
    it('accepts valid emails', () => {
      assert.ok(EMAIL_REGEX.test('a@b.co'));
      assert.ok(EMAIL_REGEX.test('user@example.com'));
      assert.ok(EMAIL_REGEX.test('user.name+tag@example.co.uk'));
    });
    it('rejects invalid emails', () => {
      assert.strictEqual(EMAIL_REGEX.test(''), false);
      assert.strictEqual(EMAIL_REGEX.test('no-at-sign'), false);
      assert.strictEqual(EMAIL_REGEX.test('@nodomain.com'), false);
      assert.strictEqual(EMAIL_REGEX.test('user@'), false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('returns no errors for strong password', () => {
      const errs = validatePasswordStrength('SecurePass1');
      assert.strictEqual(errs.length, 0);
    });
    it('requires minimum length', () => {
      const errs = validatePasswordStrength('Short1');
      assert.ok(errs.some((e) => e.includes('8 characters')));
    });
    it('requires uppercase', () => {
      const errs = validatePasswordStrength('alllowercase1');
      assert.ok(errs.some((e) => e.toLowerCase().includes('uppercase')));
    });
    it('requires lowercase', () => {
      const errs = validatePasswordStrength('ALLUPPERCASE1');
      assert.ok(errs.some((e) => e.toLowerCase().includes('lowercase')));
    });
    it('requires number', () => {
      const errs = validatePasswordStrength('NoNumbersHere');
      assert.ok(errs.some((e) => e.toLowerCase().includes('number')));
    });
  });
});
