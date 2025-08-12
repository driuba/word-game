import type { DateTime } from 'luxon';
import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeValueTransformer } from './utils.js';
import type { Word } from './word.js';
import type { WordRightUser } from './wordRightUser.js';

/** TODO:
 * Add guessed / expired word id for unique indexing. That way I could prevent concurrency issues for inserting new rights into the table.
 * Another idea to could be to persist user identifier that set the new word.
 * Maybe drop the index, realistically, this table will have a bunch of insert and delete operations and not as much reads.
 * I might want to do a job, that's dedicated to inserting word rights. That would work well with config changes.
 *   It could be scheduled to run every hour. Insert for a channel should be done as a single transaction to add validations with select locks.
 * Test transaction locking, to see if read commited works in a manner that waits for transaction to commit when filters overlap.
 * Word guess and word right insert should be one transaction.
 * Word set and word right removal should be one transactions.
 *   Select locks should be enough for to solve race conditions.
 */
@Entity({ name: 'WordRights' })
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

	@JoinColumn({ name: 'WordId' })
	@OneToOne('Words', (w: Word) => w.right, {
		cascade: false,
		eager: false,
		nullable: false,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE'
	})
	readonly word!: Word;

	@Column({
		name: 'WordId',
		nullable: false,
		type: 'integer',
		unique: true,
		update: false
	})
	readonly wordId!: number;
}
