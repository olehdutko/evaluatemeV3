import { Logger, createLogger } from '../logging/logger';

export class MigrationGuard {
  private readonly logger: Logger = createLogger('MigrationGuard');

  private static readonly DESTRUCTIVE_KEYWORDS = [
    'DROP TABLE',
    'DROP COLUMN',
    'DELETE FROM',
    'TRUNCATE',
    'ALTER TABLE .* DROP',
    'RENAME TABLE',
    'MODIFY COLUMN',
    'CHANGE COLUMN',
  ];

  constructor(private readonly options: { forceDestructive: boolean }) {}

  checkSql(sql: string): void {
    const destructive = MigrationGuard.DESTRUCTIVE_KEYWORDS.some((keyword) => {
      const pattern = new RegExp(keyword, 'i');
      return pattern.test(sql);
    });

    if (destructive) {
      this.logger.error('Destructive SQL operation detected', { sql });
      if (!this.options.forceDestructive) {
        throw new Error(
          'Destructive migration operation blocked. Use --force-destructive only if you understand the risk.',
        );
      }
      this.logger.warn('Destructive SQL operation allowed due to --force-destructive', { sql });
    }
  }

  checkOperation(operation: string, target: string): void {
    const destructiveOperations = ['drop', 'delete', 'truncate', 'remove', 'rename', 'modify'];
    if (destructiveOperations.includes(operation.toLowerCase())) {
      this.logger.error('Destructive migration operation detected', { operation, target });
      if (!this.options.forceDestructive) {
        throw new Error(
          `Destructive migration operation "${operation}" on "${target}" blocked. Use --force-destructive only if you understand the risk.`,
        );
      }
      this.logger.warn('Destructive operation allowed due to --force-destructive', { operation, target });
    }
  }
}
