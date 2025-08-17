import type { DateTime } from 'luxon';
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import config from '~/config.js';
import { DateTimeValueTransformer, execute, insert, update } from './utils.js';

@Entity({ name: 'Words' })
export class Word extends BaseEntity {
	@Column({
		generated: true,
		insert: false,
		name: 'Active',
		type: 'boolean',
		update: false
	})
	readonly active!: boolean;

	@Column({
		length: 50,
		name: 'ChannelId',
		nullable: false,
		type: 'character varying',
		update: false
	})
	@Index()
	readonly channelId!: string;

	@Column({
		generated: true,
		insert: false,
		name: 'Created',
		nullable: false,
		transformer: new DateTimeValueTransformer(),
		type: 'timestamp with time zone',
		update: false
	})
	readonly created!: DateTime<true>;

	@Column({
		default: null,
		name: 'Expired',
		nullable: true,
		transformer: new DateTimeValueTransformer(),
		type: 'timestamp with time zone'
	})
	expired!: DateTime<true> | null;

	@PrimaryGeneratedColumn({
		name: 'Id',
		type: 'integer'
	})
	readonly id!: number;

	@Column({
		default: 0,
		name: 'Score',
		nullable: false,
		type: 'integer'
	})
	score!: number;

	@Column({
		default: null,
		generated: true,
		insert: false,
		name: 'Modified',
		nullable: true,
		transformer: new DateTimeValueTransformer(),
		type: 'timestamp with time zone',
		update: false
	})
	readonly modified!: DateTime<true> | null;

	@Column({
		length: 50,
		name: 'UserIdCreator',
		nullable: false,
		type: 'character varying',
		update: false
	})
	@Index()
	readonly userIdCreator!: string;

	@Column({
		default: null,
		length: 50,
		name: 'UserIdGuesser',
		type: 'character varying',
		nullable: true
	})
	@Index()
	userIdGuesser!: string | null;

	@Column({
		name: 'Word',
		nullable: false,
		type: 'character varying',
		update: false
	})
	readonly word!: string;

	insert() {
		return insert(this, Word);
	}

	tryAddScore(value: number) {
		return execute(
			Word
				.createQueryBuilder()
				.useTransaction(true)
				.update()
				.set({
					score() {
						return `"Score" + ${value.toFixed()}`;
					}
				})
				.where(
					'"Active" AND ' +
					'"Id" = :id AND ' +
					'coalesce(now() - "Modified" > :interval, true)',
					{
						id: this.id,
						interval: config.wg.wordTimeoutScore?.toISO() ?? null
					}
				),
			this,
			Word.getRepository().metadata
		);
	}

	trySetExpired() {
		return execute(
			Word
				.createQueryBuilder()
				.useTransaction(true)
				.update()
				.set({
					expired() {
						return 'now()';
					}
				})
				.where(
					'"Active" AND ' +
					'"Id" = :id AND ' +
					'(now() - "Created" > :intervalGlobal OR ' +
					'now() - coalesce("Modified", "Created") > :intervalUsage)',
					{
						id: this.id,
						intervalGlobal: config.wg.wordTimeoutGlobal?.toISO() ?? null,
						intervalUsage: config.wg.wordTimeoutUsage?.toISO() ?? null
					}
				),
			this,
			Word.getRepository().metadata
		);
	}

	trySetUserIdGuesser(value: string) {
		return execute(
			Word
				.createQueryBuilder()
				.useTransaction(true)
				.update()
				.set({
					userIdGuesser: value
				})
				.where('"Active" AND "Id" = :id', { id: this.id }),
			this,
			Word.getRepository().metadata
		);
	}

	update() {
		return update(this, Word);
	}
}

export type WordActive = Word & { active: true, expired: null, userIdGuesser: null };
export type WordInactive = Word & { active: false } & ({ expired: DateTime<true>, userIdGuesser: null } | { expired: null, userIdGuesser: string });

export function assertWord(_word: Word): asserts _word is WordActive | WordInactive {
	// ignore
}

export function isWordActive(word: WordActive | WordInactive): word is WordActive {
	return word.active;
}
