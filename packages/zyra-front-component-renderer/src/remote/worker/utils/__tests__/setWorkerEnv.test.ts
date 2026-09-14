import { setWorkerEnv } from '../setWorkerEnv';

describe('setWorkerEnv', () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>)['process'];
  });

  it('should set process.env on globalThis', () => {
    setWorkerEnv({
      ZYRA_APP_ACCESS_TOKEN: 'test-key',
      ZYRA_API_URL: 'https://api.example.com',
    });

    const processObject = (globalThis as Record<string, unknown>)[
      'process'
    ] as Record<string, unknown>;
    const processEnvironment = processObject['env'] as Record<string, string>;

    expect(processEnvironment['ZYRA_APP_ACCESS_TOKEN']).toBe('test-key');
    expect(processEnvironment['ZYRA_API_URL']).toBe(
      'https://api.example.com',
    );
  });

  it('should preserve existing process properties and environment values', () => {
    (globalThis as Record<string, unknown>)['process'] = {
      env: {
        EXISTING_VALUE: 'existing',
      },
      version: 'test-version',
    };

    setWorkerEnv({
      ZYRA_APP_ACCESS_TOKEN: 'test-key',
    });

    const processObject = (globalThis as Record<string, unknown>)[
      'process'
    ] as Record<string, unknown>;
    const processEnvironment = processObject['env'] as Record<string, string>;

    expect(processObject['version']).toBe('test-version');
    expect(processEnvironment['EXISTING_VALUE']).toBe('existing');
    expect(processEnvironment['ZYRA_APP_ACCESS_TOKEN']).toBe('test-key');
  });
});
