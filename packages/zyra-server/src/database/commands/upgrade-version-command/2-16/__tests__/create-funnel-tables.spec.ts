import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';
import { CreateFunnelTablesFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-instance-command-fast-1791000000000-create-funnel-tables';

const collectQueries = async (
  run: (queryRunner: { query: jest.Mock }) => Promise<void>,
): Promise<string[]> => {
  const queryRunner = { query: jest.fn().mockResolvedValue(undefined) };

  await run(queryRunner);

  return queryRunner.query.mock.calls.map(([sql]) => String(sql));
};

const indexOfQuery = (queries: string[], fragment: string): number =>
  queries.findIndex((sql) => sql.includes(fragment));

describe('CreateFunnelTablesFastInstanceCommand', () => {
  const command = new CreateFunnelTablesFastInstanceCommand();

  it('should be registered so the upgrade command runs it', () => {
    expect(INSTANCE_COMMANDS).toContain(CreateFunnelTablesFastInstanceCommand);
  });

  it('should create both tables and their enums', async () => {
    const queries = await collectQueries((queryRunner) =>
      command.up(queryRunner as never),
    );

    expect(queries.join('\n')).toEqual(
      expect.stringContaining('CREATE TABLE "core"."funnelPage"'),
    );
    expect(queries.join('\n')).toEqual(
      expect.stringContaining('CREATE TABLE "core"."funnelLead"'),
    );
    expect(indexOfQuery(queries, 'funnelPage_type_enum" AS ENUM')).toBeGreaterThan(
      -1,
    );
    expect(
      indexOfQuery(queries, 'funnelPage_status_enum" AS ENUM'),
    ).toBeGreaterThan(-1);
  });

  it('should create the enums and tables before the foreign keys that use them', async () => {
    const queries = await collectQueries((queryRunner) =>
      command.up(queryRunner as never),
    );

    const lastCreate = Math.max(
      indexOfQuery(queries, 'CREATE TYPE "core"."funnelPage_type_enum"'),
      indexOfQuery(queries, 'CREATE TYPE "core"."funnelPage_status_enum"'),
      indexOfQuery(queries, 'CREATE TABLE "core"."funnelPage"'),
      indexOfQuery(queries, 'CREATE TABLE "core"."funnelLead"'),
    );
    const firstForeignKey = indexOfQuery(queries, 'ADD CONSTRAINT "FK_');

    expect(firstForeignKey).toBeGreaterThan(lastCreate);
  });

  it('should keep one lead deletable together with its workspace and page', async () => {
    const queries = await collectQueries((queryRunner) =>
      command.up(queryRunner as never),
    );
    const foreignKeys = queries.filter((sql) => sql.includes('FOREIGN KEY'));

    expect(foreignKeys).toHaveLength(3);
    foreignKeys.forEach((sql) => {
      expect(sql).toContain('ON DELETE CASCADE');
    });
  });

  it('should undo everything in reverse order on down', async () => {
    const queries = await collectQueries((queryRunner) =>
      command.down(queryRunner as never),
    );

    const dropLead = indexOfQuery(queries, 'DROP TABLE "core"."funnelLead"');
    const dropPage = indexOfQuery(queries, 'DROP TABLE "core"."funnelPage"');
    const dropTypes = Math.min(
      indexOfQuery(queries, 'DROP TYPE "core"."funnelPage_type_enum"'),
      indexOfQuery(queries, 'DROP TYPE "core"."funnelPage_status_enum"'),
    );

    expect(dropLead).toBeGreaterThan(-1);
    expect(dropPage).toBeGreaterThan(dropLead);
    expect(dropTypes).toBeGreaterThan(dropPage);
  });
});
