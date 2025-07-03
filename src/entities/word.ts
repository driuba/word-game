import type { DateTime } from 'luxon';
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeValueTransformer, insert, update } from './utils.js';

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

	update() {
		return update(this, Word);
	}
}

type Active = Word & { active: true, expired: null, userIdGuesser: null };
type Inactive = Word & { active: false } & ({ expired: DateTime<true>, userIdGuesser: null } | { expired: null, userIdGuesser: string });

export function assertWord(_word: Word): asserts _word is Active | Inactive {
	// ignore
}

export function isWordActive(word: Active | Inactive): word is Active {
	return word.active;
}
