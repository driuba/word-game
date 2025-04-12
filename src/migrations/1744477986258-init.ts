import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1744477986258 implements MigrationInterface {
    name = 'Init1744477986258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Words" ("Created" datetime NOT NULL DEFAULT (datetime('now')), "Id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "Score" integer NOT NULL DEFAULT (0), "Modified" datetime NOT NULL DEFAULT (datetime('now')), "Word" varchar NOT NULL, "ChannelId" integer NOT NULL, "UserIdCreator" integer NOT NULL, "UserIdGuesser" integer)`);
        await queryRunner.query(`CREATE TABLE "Users" ("Id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "UserId" varchar(50) NOT NULL, CONSTRAINT "UQ_aedbd821ea6272148b6a8f18ae6" UNIQUE ("UserId"))`);
        await queryRunner.query(`CREATE TABLE "Channels" ("Id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ChannelId" varchar(50) NOT NULL, CONSTRAINT "UQ_8df2e12d132235c6ff8c5f881fd" UNIQUE ("ChannelId"))`);
        await queryRunner.query(`CREATE TABLE "ChannelUsers" ("ChannelId" integer NOT NULL, "UserId" integer NOT NULL, PRIMARY KEY ("ChannelId", "UserId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_722e4597249a99aa2a2c41202d" ON "ChannelUsers" ("ChannelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5cb8c0fa2ad31f01e85076fbf9" ON "ChannelUsers" ("UserId") `);
        await queryRunner.query(`CREATE TABLE "temporary_Words" ("Created" datetime NOT NULL DEFAULT (datetime('now')), "Id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "Score" integer NOT NULL DEFAULT (0), "Modified" datetime NOT NULL DEFAULT (datetime('now')), "Word" varchar NOT NULL, "ChannelId" integer NOT NULL, "UserIdCreator" integer NOT NULL, "UserIdGuesser" integer, CONSTRAINT "FK_7a5fe03f7122fb5ca505e56c129" FOREIGN KEY ("ChannelId") REFERENCES "Channels" ("Id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_5f3a1c9ea3160648b5afdf369d6" FOREIGN KEY ("UserIdCreator") REFERENCES "Users" ("Id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_01f4cba697b9581dad8ac459d5c" FOREIGN KEY ("UserIdGuesser") REFERENCES "Users" ("Id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_Words"("Created", "Id", "Score", "Modified", "Word", "ChannelId", "UserIdCreator", "UserIdGuesser") SELECT "Created", "Id", "Score", "Modified", "Word", "ChannelId", "UserIdCreator", "UserIdGuesser" FROM "Words"`);
        await queryRunner.query(`DROP TABLE "Words"`);
        await queryRunner.query(`ALTER TABLE "temporary_Words" RENAME TO "Words"`);
        await queryRunner.query(`DROP INDEX "IDX_722e4597249a99aa2a2c41202d"`);
        await queryRunner.query(`DROP INDEX "IDX_5cb8c0fa2ad31f01e85076fbf9"`);
        await queryRunner.query(`CREATE TABLE "temporary_ChannelUsers" ("ChannelId" integer NOT NULL, "UserId" integer NOT NULL, CONSTRAINT "FK_722e4597249a99aa2a2c41202d2" FOREIGN KEY ("ChannelId") REFERENCES "Channels" ("Id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_5cb8c0fa2ad31f01e85076fbf90" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("ChannelId", "UserId"))`);
        await queryRunner.query(`INSERT INTO "temporary_ChannelUsers"("ChannelId", "UserId") SELECT "ChannelId", "UserId" FROM "ChannelUsers"`);
        await queryRunner.query(`DROP TABLE "ChannelUsers"`);
        await queryRunner.query(`ALTER TABLE "temporary_ChannelUsers" RENAME TO "ChannelUsers"`);
        await queryRunner.query(`CREATE INDEX "IDX_722e4597249a99aa2a2c41202d" ON "ChannelUsers" ("ChannelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5cb8c0fa2ad31f01e85076fbf9" ON "ChannelUsers" ("UserId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_5cb8c0fa2ad31f01e85076fbf9"`);
        await queryRunner.query(`DROP INDEX "IDX_722e4597249a99aa2a2c41202d"`);
        await queryRunner.query(`ALTER TABLE "ChannelUsers" RENAME TO "temporary_ChannelUsers"`);
        await queryRunner.query(`CREATE TABLE "ChannelUsers" ("ChannelId" integer NOT NULL, "UserId" integer NOT NULL, PRIMARY KEY ("ChannelId", "UserId"))`);
        await queryRunner.query(`INSERT INTO "ChannelUsers"("ChannelId", "UserId") SELECT "ChannelId", "UserId" FROM "temporary_ChannelUsers"`);
        await queryRunner.query(`DROP TABLE "temporary_ChannelUsers"`);
        await queryRunner.query(`CREATE INDEX "IDX_5cb8c0fa2ad31f01e85076fbf9" ON "ChannelUsers" ("UserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_722e4597249a99aa2a2c41202d" ON "ChannelUsers" ("ChannelId") `);
        await queryRunner.query(`ALTER TABLE "Words" RENAME TO "temporary_Words"`);
        await queryRunner.query(`CREATE TABLE "Words" ("Created" datetime NOT NULL DEFAULT (datetime('now')), "Id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "Score" integer NOT NULL DEFAULT (0), "Modified" datetime NOT NULL DEFAULT (datetime('now')), "Word" varchar NOT NULL, "ChannelId" integer NOT NULL, "UserIdCreator" integer NOT NULL, "UserIdGuesser" integer)`);
        await queryRunner.query(`INSERT INTO "Words"("Created", "Id", "Score", "Modified", "Word", "ChannelId", "UserIdCreator", "UserIdGuesser") SELECT "Created", "Id", "Score", "Modified", "Word", "ChannelId", "UserIdCreator", "UserIdGuesser" FROM "temporary_Words"`);
        await queryRunner.query(`DROP TABLE "temporary_Words"`);
        await queryRunner.query(`DROP INDEX "IDX_5cb8c0fa2ad31f01e85076fbf9"`);
        await queryRunner.query(`DROP INDEX "IDX_722e4597249a99aa2a2c41202d"`);
        await queryRunner.query(`DROP TABLE "ChannelUsers"`);
        await queryRunner.query(`DROP TABLE "Channels"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "Words"`);
    }

}
