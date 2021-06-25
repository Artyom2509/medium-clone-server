import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUsers1624626093085 implements MigrationInterface {
  name = 'AddUsernameToUsers1624626093085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
  }
}
