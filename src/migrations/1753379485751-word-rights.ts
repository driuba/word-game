import type { MigrationInterface, QueryRunner } from "typeorm";

export class WordRights1753379485751 implements MigrationInterface {
    name = 'WordRights1753379485751'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "WordRights" ("ChannelId" character varying(50) NOT NULL, "Created" timestamp with time zone NOT NULL DEFAULT now(), "Id" SERIAL NOT NULL, CONSTRAINT "PK_a5b03def2d44d685206f4062944" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_483cd941c3a0bf72917c51eb4e" ON "WordRights" ("ChannelId") `);
        await queryRunner.query(`CREATE TABLE "WordRightUsers" ("Created" timestamp with time zone NOT NULL DEFAULT now(), "Id" SERIAL NOT NULL, "UserId" character varying(50) NOT NULL, "WordRightId" integer NOT NULL, CONSTRAINT "PK_de7559f2f37093a695f568dee9c" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`ALTER TABLE "WordRightUsers" ADD CONSTRAINT "FK_13b96cb7a2fe36c481e7cfbd249" FOREIGN KEY ("WordRightId") REFERENCES "WordRights"("Id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "WordRightUsers" DROP CONSTRAINT "FK_13b96cb7a2fe36c481e7cfbd249"`);
        await queryRunner.query(`DROP TABLE "WordRightUsers"`);
        await queryRunner.query(`DROP INDEX "wg"."IDX_483cd941c3a0bf72917c51eb4e"`);
        await queryRunner.query(`DROP TABLE "WordRights"`);
    }

}
