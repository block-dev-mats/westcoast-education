import { describe, expect, it } from 'vitest';
import { validateRegisterForm } from './registerValidation.js';

describe('validateRegisterForm', () => {
  it('returns null for valid register data', () => {
    const result = validateRegisterForm({
      name: 'Anna Svensson',
      billingAddress: 'Storgatan 1, 411 01 Goteborg',
      email: 'anna@example.com',
      phone: '0701234567',
      password: '123456'
    });

    expect(result).toBeNull();
  });

  it('returns an error if the name is too short', () => {
    const result = validateRegisterForm({
      name: 'A',
      billingAddress: 'Storgatan 1, 411 01 Goteborg',
      email: 'anna@example.com',
      phone: '0701234567',
      password: '123456'
    });

    expect(result).toBe('Name must be between 2 and 50 characters.');
  });

  it('returns an error if the email is invalid', () => {
    const result = validateRegisterForm({
      name: 'Anna Svensson',
      billingAddress: 'Storgatan 1, 411 01 Goteborg',
      email: 'anna.example.com',
      phone: '0701234567',
      password: '123456'
    });

    expect(result).toBe('Enter a valid email address.');
  });

  it('returns an error if the phone number is invalid', () => {
    const result = validateRegisterForm({
      name: 'Anna Svensson',
      billingAddress: 'Storgatan 1, 411 01 Goteborg',
      email: 'anna@example.com',
      phone: 'abc',
      password: '123456'
    });

    expect(result).toBe('Enter a valid mobile phone number.');
  });

  it('returns an error if the password is too short', () => {
    const result = validateRegisterForm({
      name: 'Anna Svensson',
      billingAddress: 'Storgatan 1, 411 01 Goteborg',
      email: 'anna@example.com',
      phone: '0701234567',
      password: '123'
    });

    expect(result).toBe('Password must be between 6 and 40 characters.');
  });
});
