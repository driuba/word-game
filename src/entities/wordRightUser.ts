import type { WordRight } from './wordRight.js';
import type { DateTime } from 'luxon';
import type { EntityManager } from 'typeorm';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeValueTransformer, insertEntities } from './utils.js';

@Entity({ name: 'WordRightUsers' })
export class WordRightUser extends BaseEntity {
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

	@JoinColumn({ name: 'WordRightId' })
	@ManyToOne('WordRights', {
		cascade: false,
		eager: false,
		nullable: false,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE'
	})
	readonly right!: WordRight;

	@Column({
		length: 50,
		name: 'UserId',
		nullable: false,
		type: 'character varying',
		update: false
	})
	readonly userId!: string;

	@Column({
		name: 'WordRightId',
		nullable: false,
		type: 'integer',
		update: false
	})
	readonly wordRightId!: number;

	static insertMany(users: WordRightUser[], entityManager?: EntityManager) {
		return insertEntities(users, this, entityManager);
	}
}
