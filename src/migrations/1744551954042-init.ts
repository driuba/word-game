import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1744551954042 implements MigrationInterface {
    name = 'Init1744551954042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Words" ("ChannelId" varchar(50) NOT NULL, "Created" datetime NOT NULL DEFAULT (datetime('now')), "Id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "Score" integer NOT NULL DEFAULT (0), "Modified" datetime NOT NULL DEFAULT (datetime('now')), "UserIdCreator" varchar(50) NOT NULL, "UserIdGuesser" varchar(50), "Word" varchar NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_7a5fe03f7122fb5ca505e56c12" ON "Words" ("ChannelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5f3a1c9ea3160648b5afdf369d" ON "Words" ("UserIdCreator") `);
        await queryRunner.query(`CREATE INDEX "IDX_01f4cba697b9581dad8ac459d5" ON "Words" ("UserIdGuesser") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_01f4cba697b9581dad8ac459d5"`);
        await queryRunner.query(`DROP INDEX "IDX_5f3a1c9ea3160648b5afdf369d"`);
        await queryRunner.query(`DROP INDEX "IDX_7a5fe03f7122fb5ca505e56c12"`);
        await queryRunner.query(`DROP TABLE "Words"`);
    }

}
