import type { WordRightUser } from './wordRightUser.js';
import type { DateTime } from 'luxon';
import type { DeepPartial, EntityManager, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeValueTransformer, deleteEntity, insertEntities } from './utils.js';

const tableName = 'WordRights' as const;

@Entity({ name: tableName })
export class WordRight extends BaseEntity {
	@Column({
		length: 50,
		name: 'ChannelId',
		nullable: false,
		type: 'character varying',
		update: false
	})
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

	@PrimaryGeneratedColumn({
		name: 'Id',
		type: 'integer'
	})
	readonly id!: number;

	@OneToMany('WordRightUsers', (wru: WordRightUser) => wru.right, {
		cascade: false,
		eager: false,
		nullable: false
	})
	readonly users!: WordRightUser[];

	static countWhere(options: FindOptionsWhere<WordRight>, entityManager?: EntityManager) {
		return entityManager
			? entityManager
				.getRepository(this)
				.count({ where: options })
			: this.countBy(options);
	}

	static countWhereGrouped(options: FindOptionsWhere<WordRight>, entityManager?: EntityManager) {
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

	static insertMany(values: DeepPartial<WordRight>[], entityManager?: EntityManager) {
		return insertEntities(values.map((v) => this.create(v)), this, entityManager);
	}

	static insertOne(value: DeepPartial<WordRight>, entityManager?: EntityManager) {
		return this.insertMany([value], entityManager).then((wrs) => wrs[0]);
	}

	static lock(entityManager: EntityManager) {
		// TODO: performance optimization, migrate to advisory lock by channel id
		return entityManager.query(`LOCK "${tableName}" IN SHARE ROW EXCLUSIVE MODE`);
	}

	static where(where: FindOptionsWhere<WordRight>, entityManager?: EntityManager) {
		const options = {
			relations: {
				users: true
			},
			where
		} satisfies FindManyOptions<WordRight>;

		return entityManager
			? entityManager
				.getRepository(this)
				.find(options)
			: this.find(options);
	}

	delete(entityManager?: EntityManager) {
		return deleteEntity(this, WordRight, entityManager);
	}
}
