import type { DateTime } from 'luxon';
import type { DeepPartial, EntityManager, FindOptionsWhere } from 'typeorm';
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import config from '~/config.js';
import { DateTimeValueTransformer, execute, insertEntities } from './utils.js';

const tableName = 'Words';

@Entity({ name: tableName })
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
		default: 0,
		name: 'Score',
		nullable: false,
		type: 'integer'
	})
	score!: number;

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
		nullable: true,
		type: 'character varying'
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

	static countWhere(options: FindOptionsWhere<Word>, entityManager?: EntityManager) {
		return entityManager
			? entityManager
				.getRepository(this)
				.count({ where: options })
			: this.countBy(options);
	}

	static countWhereGrouped(options: FindOptionsWhere<Word>, entityManager?: EntityManager) {
		return (entityManager?.getRepository(this) ?? this.getRepository())
			.createQueryBuilder()
			.select('"ChannelId"', 'channelId')
			.addSelect('COUNT(1)', 'count')
			.where(options)
			.groupBy('"ChannelId"')
			.getRawMany<{ channelId: string; count: string }>()
			.then((rs) => rs.reduce(
				(a, r) => {
					a.set(r.channelId, parseInt(r.count));

					return a;
				},
				new Map<string, number>()
			));
	}

	static insertOne(value: DeepPartial<Word>, entityManager?: EntityManager) {
		return insertEntities([this.create(value)], this, entityManager).then((ws) => ws[0]);
	}

	static where(options: FindOptionsWhere<Word>, entityManager?: EntityManager) {
		return entityManager
			? entityManager
				.getRepository(this)
				.find({ where: options })
			: this.findBy(options);
	}

	tryAddScore(value: number, entityManager?: EntityManager) {
		const repository = entityManager?.getRepository(Word) ?? Word.getRepository();

		return execute(
			repository
				.createQueryBuilder()
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
			[this],
			repository.metadata
		).then((ws) => ws[0]);
	}

	trySetExpired(entityManager?: EntityManager) {
		const repository = entityManager?.getRepository(Word) ?? Word.getRepository();

		return execute(
			repository
				.createQueryBuilder()
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
			[this],
			repository.metadata
		).then((ws) => ws[0]);
	}

	trySetUserIdGuesser(value: string, entityManager?: EntityManager) {
		const repository = entityManager?.getRepository(Word) ?? Word.getRepository();

		return execute(
			repository
				.createQueryBuilder()
				.update()
				.set({
					userIdGuesser: value
				})
				.where('"Active" AND "Id" = :id', { id: this.id }),
			[this],
			repository.metadata
		).then((ws) => ws[0]);
	}
}

type WordActive = Word & { active: true; expired: null; userIdGuesser: null };
type WordInactive = Word & { active: false } & ({ expired: DateTime<true>; userIdGuesser: null } | { expired: null; userIdGuesser: string });

export function isWordActive(word: Word): word is WordActive {
	return word.active;
}

export function isWordInactive(word: Word): word is WordInactive {
	return !word.active;
}
