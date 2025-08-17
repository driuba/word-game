import type { DateTime } from 'luxon';
import type { EntityManager } from 'typeorm';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeValueTransformer } from './utils.js';
import type { WordRightUser } from './wordRightUser.js';

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

	static get(channelId: string, entityManager?: EntityManager) {
		return entityManager
			? entityManager
				.getRepository(this)
				.find({
					lock: {
						mode: 'pessimistic_write',
						tables: [tableName]
					},
					where: { channelId }
				})
			: this.find({
				where: { channelId }
			});
	}
}
