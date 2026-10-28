import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/zyra-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { getStandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/zyra-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';
import { computeMyFirstDashboardWidgets } from 'src/engine/workspace-manager/zyra-standard-application/utils/page-layout-widget/compute-my-first-dashboard-widgets.util';

const buildWidgets = () =>
  computeMyFirstDashboardWidgets({
    now: '2026-10-28T00:00:00.000Z',
    workspaceId: '8d342e51-c39b-4392-a143-2ceef0317290',
    zyraStandardApplicationId: '20202020-64aa-4b6f-b003-9c74b97cee20',
    standardObjectMetadataRelatedEntityIds:
      getStandardObjectMetadataRelatedEntityIds(),
    standardPageLayoutMetadataRelatedEntityIds:
      getStandardPageLayoutMetadataRelatedEntityIds(),
  });

const serialize = (widget: unknown): string => JSON.stringify(widget);

describe('computeMyFirstDashboardWidgets', () => {
  it('should return the three KPI widgets first, in order', () => {
    const titles = buildWidgets()
      .slice(0, 3)
      .map((widget) => widget.title);

    expect(titles).toEqual([
      'Novos contatos (7 dias)',
      'Oportunidades abertas',
      'Tarefas de hoje',
    ]);
  });

  it('should filter new contacts by creation date in the last 7 days', () => {
    const [newContacts] = buildWidgets();

    expect(serialize(newContacts)).toContain('PAST_7_DAY');
  });

  it('should count only open opportunities', () => {
    const openOpportunities = buildWidgets()[1];
    const serialized = serialize(openOpportunities);

    expect(serialized).toContain('NEW');
    expect(serialized).toContain('PROPOSAL');
    expect(serialized).not.toContain('CUSTOMER');
  });

  it('should count the tasks due today', () => {
    const tasksDueToday = buildWidgets()[2];

    expect(serialize(tasksDueToday)).toContain('THIS_1_DAY');
  });

  it('should not count finished tasks as due today', () => {
    const serialized = serialize(buildWidgets()[2]);

    expect(serialized).toContain('TODO');
    expect(serialized).toContain('IN_PROGRESS');
    expect(serialized).not.toContain('DONE');
  });

  it('should include the pipeline by stage chart', () => {
    const titles = buildWidgets().map((widget) => widget.title);

    expect(titles).toContain('Funil por etapa');
  });

  it('should include the tasks of the next 7 days', () => {
    const upcoming = buildWidgets().find(
      (widget) => widget.title === 'Próximos compromissos',
    );

    expect(serialize(upcoming)).toContain('NEXT_7_DAY');
  });

  it('should not contain the old sample or welcome widgets', () => {
    const titles = buildWidgets().map((widget) => widget.title);

    expect(titles).not.toContain('Untitled Rich Text');
    expect(titles).not.toContain('Deals by Company');
    expect(titles).not.toContain('Revenue Timeline');
  });

  it('should produce one widget with a unique universal identifier per entry', () => {
    const identifiers = buildWidgets().map(
      (widget) => widget.universalIdentifier,
    );

    expect(new Set(identifiers).size).toBe(identifiers.length);
  });
});
