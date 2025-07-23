import type { DateTime } from 'luxon';
import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeValueTransformer } from './utils.js';
import type { WordRightUser } from './wordRightUser.js';

@Entity({ name: 'WordRights' })
export class WordRight extends BaseEntity {
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

	@PrimaryGeneratedColumn({
		name: 'Id',
		type: 'integer'
	})
	readonly id!: number;

	@OneToMany('WordRightUsers', (wru: WordRightUser) => wru.right, {
		cascade: false,
		eager: true,
		nullable: false
	})
	readonly users!: WordRightUser[];
}
