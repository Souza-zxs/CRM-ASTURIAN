export const getSyncErrorRecoveryHint = (
  message: string | undefined,
): string | undefined => {
  const normalizedMessage = (message ?? '').toLowerCase();

  if (normalizedMessage.includes('not installed')) {
    return 'Hint: run `yarn zyra dev --once` to register the app in this workspace, then retry.';
  }

  if (
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('universalidentifier') ||
    /migration action .* failed/.test(normalizedMessage)
  ) {
    return 'Hint: a metadata conflict was detected. Preview the plan with `yarn zyra dev --once --dry-run`; if it persists, run `yarn zyra app:uninstall -y` then sync again.';
  }

  return undefined;
};
