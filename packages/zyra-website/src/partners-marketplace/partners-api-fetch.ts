// Authed GET against the Zyra partners API. Env-gated: throws when the env is
// missing so the seam's catch can fall back to [] cleanly.
export async function partnersApiFetch(path: string): Promise<unknown> {
  const baseUrl = process.env.ZYRA_PARTNERS_API_URL;
  const apiKey = process.env.ZYRA_PARTNERS_API_KEY;
  if (baseUrl === undefined || apiKey === undefined) {
    throw new Error('ZYRA_PARTNERS_API_URL / ZYRA_PARTNERS_API_KEY unset');
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Zyra partners API ${response.status} ${path}: ${body.slice(0, 300)}`,
    );
  }

  return response.json();
}
