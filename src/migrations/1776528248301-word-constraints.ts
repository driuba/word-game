import type { MigrationInterface, QueryRunner } from "typeorm";

export class WordConstraints1776528248301 implements MigrationInterface {
    name = 'WordConstraints1776528248301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "WordRightUsers" RENAME CONSTRAINT "WordRightUsers_WordRightId_fkey" TO "FK_13b96cb7a2fe36c481e7cfbd249"`);
        await queryRunner.query(String.raw`WITH _words_illegal AS
(
	SELECT
		"Id",
		row_number() OVER
		(
			PARTITION BY
				"ChannelId",
				"UserIdCreator",
				"Word"
			ORDER BY "Created"
		)
	FROM "Words"
	WHERE "Active"
)
UPDATE "Words" w
SET "Expired" = now()
FROM _words_illegal wi
WHERE
	w."Id" = wi."Id" AND
	wi.row_number > 1;`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e6949ec8f195f5f0f19d1ca32b" ON "Words" ("ChannelId", "UserIdCreator", "Word") WHERE "Active"`);
        await queryRunner.query(`ALTER TABLE "Words" ADD CONSTRAINT "CHK_a696f29ff6aa5986f115c38ccc" CHECK ("Word" ~ '^[[:alpha:]]+$')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Words" DROP CONSTRAINT "CHK_a696f29ff6aa5986f115c38ccc"`);
        await queryRunner.query(`DROP INDEX "wg"."IDX_e6949ec8f195f5f0f19d1ca32b"`);
        await queryRunner.query(`ALTER TABLE "WordRightUsers" RENAME CONSTRAINT "FK_13b96cb7a2fe36c481e7cfbd249" TO "WordRightUsers_WordRightId_fkey"`);
    }

}
