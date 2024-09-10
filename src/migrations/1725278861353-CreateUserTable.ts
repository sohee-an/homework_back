import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1725278861353 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TYPE IF EXISTS "user_role_enum"');
    await queryRunner.query(`
  CREATE TYPE user_role_enum  AS ENUM('ADMIN', 'USER',)
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
