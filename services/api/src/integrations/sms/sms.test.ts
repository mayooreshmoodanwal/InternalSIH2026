import { isIndianPhoneNumber, toE164 } from './sms.service.js';

describe('SMS Hybrid Routing Helper', () => {
  it('should identify Indian phone numbers (+91 and 10-digit)', () => {
    expect(isIndianPhoneNumber('+919876543210')).toBe(true);
    expect(isIndianPhoneNumber('9876543210')).toBe(true);
    expect(isIndianPhoneNumber('+91 99990 00001')).toBe(true);
  });

  it('should identify International phone numbers as non-Indian', () => {
    expect(isIndianPhoneNumber('+12025550123')).toBe(false);
    expect(isIndianPhoneNumber('+447911123456')).toBe(false);
    expect(isIndianPhoneNumber('+33612345678')).toBe(false);
    expect(isIndianPhoneNumber('+819012345678')).toBe(false);
  });

  it('should correctly format to E.164 standard', () => {
    expect(toE164('9876543210')).toBe('+919876543210');
    expect(toE164('+1 202 555 0123')).toBe('+12025550123');
    expect(toE164('+91-98765-43210')).toBe('+919876543210');
  });
});
