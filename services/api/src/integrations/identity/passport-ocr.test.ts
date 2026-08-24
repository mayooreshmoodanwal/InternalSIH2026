import { parseMRZ } from './passport-ocr.service.js';

describe('Passport OCR MRZ Parser', () => {
  it('should correctly parse standard ICAO 9303 TD3 2-line passport MRZ', () => {
    const sampleMRZ = `
P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
L898902C36UTO7408122F1204159ZE184226B<<<<<10
    `.trim();

    const parsed = parseMRZ(sampleMRZ);
    expect(parsed).not.toBeNull();
    if (!parsed) return;

    expect(parsed.documentType).toBe('P');
    expect(parsed.issuingCountry).toBe('UTO');
    expect(parsed.lastName).toBe('ERIKSSON');
    expect(parsed.firstNames).toBe('ANNA MARIA');
    expect(parsed.passportNumber).toBe('L898902C3');
    expect(parsed.nationality).toBe('UTO');
    expect(parsed.dateOfBirth).toBe('1974-08-12');
    expect(parsed.sex).toBe('F');
    expect(parsed.expirationDate).toBe('2012-04-15');
  });

  it('should return null for malformed or incomplete MRZ text', () => {
    const invalidMRZ = 'P<SHORT<<LINE\nINVALID';
    const parsed = parseMRZ(invalidMRZ);
    expect(parsed).toBeNull();
  });
});
