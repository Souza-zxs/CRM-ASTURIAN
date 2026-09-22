import * as zyraSdkDefine from '@/sdk/define';
import {
  ZYRA_SDK_DEFINE_STUBBED_EXPORTS,
  isDefineFactoryExportName,
} from '@/cli/utilities/build/common/plugins/stub-zyra-sdk-define.plugin';

describe('stub-zyra-sdk-define plugin', () => {
  const realExports = Object.keys(zyraSdkDefine).sort();
  const stubbedExports = [
    ...ZYRA_SDK_DEFINE_STUBBED_EXPORTS.factories,
    ...ZYRA_SDK_DEFINE_STUBBED_EXPORTS.any,
  ].sort();

  it('classifies every zyra-sdk/define value-export', () => {
    expect(stubbedExports).toEqual(realExports);
  });

  it('classifies all defineX exports (and createValidationResult) as factories', () => {
    const expectedFactories = realExports
      .filter(isDefineFactoryExportName)
      .sort();

    expect([...ZYRA_SDK_DEFINE_STUBBED_EXPORTS.factories].sort()).toEqual(
      expectedFactories,
    );
  });

  it('every factory is callable in the real module (would-be misclassification guard)', () => {
    for (const name of ZYRA_SDK_DEFINE_STUBBED_EXPORTS.factories) {
      const actual = (zyraSdkDefine as unknown as Record<string, unknown>)[
        name
      ];
      expect(typeof actual).toBe('function');
    }
  });

  // Snapshot to surface new exports in PR review. Update with
  // `npx vitest -u` when intentional.
  it('matches the recorded export partition', () => {
    expect(ZYRA_SDK_DEFINE_STUBBED_EXPORTS).toMatchSnapshot();
  });
});
