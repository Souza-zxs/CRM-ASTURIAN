import { type EachTestingContext } from 'zyra-shared/testing';

import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';

type GetDomainNameFromHandleTestCase = EachTestingContext<{
  input: string;
  expected: string;
}>;

describe('getDomainNameFromHandle', () => {
  const testCases: GetDomainNameFromHandleTestCase[] = [
    {
      title: 'should extract domain from email handle',
      context: {
        input: 'user@zyra.dev',
        expected: 'zyra.dev',
      },
    },
    {
      title: 'should extract domain from email handle with subdomain',
      context: {
        input: 'user@app.zyra.dev',
        expected: 'zyra.dev',
      },
    },
    {
      title: 'should extract domain from email handle with multiple subdomains',
      context: {
        input: 'user@test.app.zyra.dev',
        expected: 'zyra.dev',
      },
    },
    {
      title: 'should handle domain with multiple parts',
      context: {
        input: 'user@zyra.co.uk',
        expected: 'zyra.co.uk',
      },
    },
    {
      title: 'should handle empty string',
      context: {
        input: '',
        expected: '',
      },
    },
    {
      title: 'should handle string without @ symbol',
      context: {
        input: 'not-an-email',
        expected: '',
      },
    },
    {
      title: 'should handle undefined handle part after @',
      context: {
        input: 'user@',
        expected: '',
      },
    },
    {
      title: 'should handle invalid domain',
      context: {
        input: 'user@not-a-valid-domain',
        expected: '',
      },
    },
  ];

  test.each(testCases)('$title', ({ context: { input, expected } }) => {
    expect(getDomainNameFromHandle(input)).toBe(expected);
  });
});
