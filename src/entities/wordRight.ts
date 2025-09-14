import type { WordRightUser } from './wordRightUser.js';
import type { DateTime } from 'luxon';
import type { DeepPartial, EntityManager, FindOptionsWhere } from 'typeorm';
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
				.count({
					lock: {
						// TODO: deprecate all table row locks, it's solved with full table lock in transaction
						mode: 'pessimistic_write',
						tables: [tableName]
					},
					where: options
				})
			: this.countBy(options);
	}

	static insertOne(value: DeepPartial<WordRight>, entityManager?: EntityManager) {
		return insertEntities([this.create(value)], this, entityManager).then((wrs) => wrs[0]);
	}

	static lock(entityManager: EntityManager) {
		return entityManager.query(`LOCK "${tableName}" IN SHARE ROW EXCLUSIVE MODE`);
	}

	static where(options: FindOptionsWhere<WordRight>, entityManager?: EntityManager) {
		return entityManager
			? entityManager
				.getRepository(this)
				.find({
					lock: {
						mode: 'pessimistic_write',
						tables: [tableName]
					},
					where: options
				})
			: this.findBy(options);
	}

	delete(entityManager?: EntityManager) {
		return deleteEntity(this, WordRight, entityManager);
	}
}
