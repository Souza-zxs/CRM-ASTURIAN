import { isValidZyraSubdomain } from '@/utils/validation/isValidZyraSubdomain';

describe('isValidZyraSubdomain', () => {
  describe('valid subdomains', () => {
    it('should accept standard alphanumeric subdomains', () => {
      expect(isValidZyraSubdomain('abc')).toBe(true);
      expect(isValidZyraSubdomain('test123')).toBe(true);
      expect(isValidZyraSubdomain('company1')).toBe(true);
      expect(isValidZyraSubdomain('workspace2024')).toBe(true);
    });

    it('should accept subdomains with hyphens in the middle', () => {
      expect(isValidZyraSubdomain('my-company')).toBe(true);
      expect(isValidZyraSubdomain('test-workspace')).toBe(true);
      expect(isValidZyraSubdomain('multi-word-subdomain')).toBe(true);
      expect(isValidZyraSubdomain('a-b-c-d-e')).toBe(true);
    });

    it('should accept minimum length subdomains (3 characters)', () => {
      expect(isValidZyraSubdomain('abc')).toBe(true);
      expect(isValidZyraSubdomain('a1b')).toBe(true);
      expect(isValidZyraSubdomain('a-b')).toBe(true);
    });

    it('should accept maximum length subdomains (30 characters)', () => {
      const exactly30 = 'a' + 'b'.repeat(28) + 'c';

      expect(exactly30.length).toBe(30);
      expect(isValidZyraSubdomain(exactly30)).toBe(true);
    });

    it('should accept numeric-only subdomains', () => {
      expect(isValidZyraSubdomain('123')).toBe(true);
      expect(isValidZyraSubdomain('456789')).toBe(true);
      expect(isValidZyraSubdomain('1-2-3')).toBe(true);
    });
  });

  describe('invalid subdomains', () => {
    it('should reject empty strings', () => {
      expect(isValidZyraSubdomain('')).toBe(false);
    });

    it('should reject subdomains shorter than 3 characters', () => {
      expect(isValidZyraSubdomain('a')).toBe(false);
      expect(isValidZyraSubdomain('ab')).toBe(false);
    });

    it('should reject subdomains longer than 30 characters', () => {
      const tooLong = 'a'.repeat(31);

      expect(isValidZyraSubdomain(tooLong)).toBe(false);
    });

    it('should reject subdomains starting with a hyphen', () => {
      expect(isValidZyraSubdomain('-test')).toBe(false);
      expect(isValidZyraSubdomain('-abc')).toBe(false);
    });

    it('should reject subdomains ending with a hyphen', () => {
      expect(isValidZyraSubdomain('test-')).toBe(false);
      expect(isValidZyraSubdomain('abc-')).toBe(false);
    });

    it('should reject subdomains with uppercase letters', () => {
      expect(isValidZyraSubdomain('Test')).toBe(false);
      expect(isValidZyraSubdomain('MyCompany')).toBe(false);
      expect(isValidZyraSubdomain('WORKSPACE')).toBe(false);
    });

    it('should reject subdomains with special characters', () => {
      expect(isValidZyraSubdomain('test@company')).toBe(false);
      expect(isValidZyraSubdomain('my_workspace')).toBe(false);
      expect(isValidZyraSubdomain('test.company')).toBe(false);
      expect(isValidZyraSubdomain('workspace#1')).toBe(false);
    });

    it('should reject subdomains with spaces', () => {
      expect(isValidZyraSubdomain('test company')).toBe(false);
      expect(isValidZyraSubdomain(' test')).toBe(false);
      expect(isValidZyraSubdomain('test ')).toBe(false);
    });

    it('should reject subdomains starting with "api-"', () => {
      expect(isValidZyraSubdomain('api-test')).toBe(false);
      expect(isValidZyraSubdomain('api-company')).toBe(false);
      expect(isValidZyraSubdomain('api-123')).toBe(false);
    });

    it('should accept subdomains containing "api" not as prefix', () => {
      expect(isValidZyraSubdomain('myapi')).toBe(true);
      expect(isValidZyraSubdomain('rapid')).toBe(true);
    });

    it('should reject subdomains with only hyphens', () => {
      expect(isValidZyraSubdomain('---')).toBe(false);
      expect(isValidZyraSubdomain('----')).toBe(false);
    });

    it('should reject whitespace-only strings', () => {
      expect(isValidZyraSubdomain('   ')).toBe(false);
      expect(isValidZyraSubdomain('\t')).toBe(false);
      expect(isValidZyraSubdomain('\n')).toBe(false);
    });

    it('should reject unicode characters', () => {
      expect(isValidZyraSubdomain('café')).toBe(false);
      expect(isValidZyraSubdomain('tëst')).toBe(false);
    });
  });
});
