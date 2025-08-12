import type { MigrationInterface, QueryRunner } from "typeorm";

export class WordRights1755001316062 implements MigrationInterface {
    name = 'WordRights1755001316062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "WordRights" ("ChannelId" character varying(50) NOT NULL, "Created" timestamp with time zone NOT NULL DEFAULT now(), "Id" SERIAL NOT NULL PRIMARY KEY, "WordId" integer NOT NULL UNIQUE REFERENCES "Words"("Id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`CREATE TABLE "WordRightUsers" ("Created" timestamp with time zone NOT NULL DEFAULT now(), "Id" SERIAL NOT NULL PRIMARY KEY, "UserId" character varying(50) NOT NULL, "WordRightId" integer NOT NULL REFERENCES "WordRights"("Id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "WordRightUsers"`);
        await queryRunner.query(`DROP TABLE "WordRights"`);
    }

}
