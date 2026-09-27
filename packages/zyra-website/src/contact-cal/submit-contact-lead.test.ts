import { isContactLeadValid } from './is-contact-lead-valid';
import { submitContactLead } from './submit-contact-lead';

const validInput = {
  email: '  Maria@Example.com ',
  name: ' Maria Silva ',
  whatsapp: '(11) 91234-5678',
};

const jsonResponse = (body: unknown, ok = true) =>
  ({ json: async () => body, ok }) as Response;

describe('isContactLeadValid', () => {
  it('accepts a complete lead', () => {
    expect(isContactLeadValid(validInput)).toBe(true);
  });

  it('rejects a blank name', () => {
    expect(isContactLeadValid({ ...validInput, name: '   ' })).toBe(false);
  });

  it('rejects a malformed email', () => {
    expect(isContactLeadValid({ ...validInput, email: 'maria@' })).toBe(false);
  });

  it('rejects a whatsapp with too few digits', () => {
    expect(isContactLeadValid({ ...validInput, whatsapp: '12-34' })).toBe(
      false,
    );
  });
});

describe('submitContactLead', () => {
  it('looks up the contact page, then posts the normalized lead against its id', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'page-id-1' }))
      .mockResolvedValueOnce(jsonResponse({ success: true }));

    const result = await submitContactLead(validInput, fetchMock);

    expect(result).toEqual({ status: 'sent' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/funnel\/[0-9a-f-]+\/contato$/);
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/funnel\/[0-9a-f-]+\/leads$/);

    const postedBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(postedBody).toEqual({
      email: 'maria@example.com',
      funnelPageId: 'page-id-1',
      name: 'Maria Silva',
      utmSource: 'site-fale-conosco',
      whatsapp: '(11) 91234-5678',
    });
  });

  it('reports unavailable when the contact page is not published', async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(jsonResponse({}, false));

    expect(await submitContactLead(validInput, fetchMock)).toEqual({
      status: 'unavailable',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports unavailable when posting the lead fails', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 'page-id-1' }))
      .mockResolvedValueOnce(jsonResponse({}, false));

    expect(await submitContactLead(validInput, fetchMock)).toEqual({
      status: 'unavailable',
    });
  });

  it('reports unavailable on a network error', async () => {
    const fetchMock = jest.fn().mockRejectedValueOnce(new Error('offline'));

    expect(await submitContactLead(validInput, fetchMock)).toEqual({
      status: 'unavailable',
    });
  });

  it('does not call the network for an invalid lead', async () => {
    const fetchMock = jest.fn();

    const result = await submitContactLead(
      { ...validInput, email: 'nope' },
      fetchMock,
    );

    expect(result.status).toBe('invalid');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
