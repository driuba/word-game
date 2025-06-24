import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Words' })
export class Word extends BaseEntity {
	@Column({
		generated: true,
		name: 'Active'
	})
	readonly active!: boolean;

	@Column({
		length: 50,
		name: 'ChannelId',
		nullable: false,
		update: false
	})
	@Index()
	readonly channelId!: string;

	@CreateDateColumn({
		name: 'Created',
		nullable: false,
		type: 'timestamp with time zone',
		update: false
	})
	readonly created!: Date;

	@CreateDateColumn({
		name: 'Expired',
		nullable: true,
		type: 'timestamp with time zone'
	})
	expired?: Date;

	@PrimaryGeneratedColumn({ name: 'Id' })
	readonly id!: number;

	@Column({
		default: 0,
		name: 'Score',
		nullable: false
	})
	score!: number;

	@UpdateDateColumn({
		name: 'Modified',
		type: 'timestamp with time zone'
	})
	readonly modified?: Date;

	@Column({
		length: 50,
		name: 'UserIdCreator',
		nullable: false,
		update: false
	})
	@Index()
	readonly userIdCreator!: string;

	@Column({
		length: 50,
		name: 'UserIdGuesser',
		nullable: true
	})
	@Index()
	userIdGuesser?: string;

	@Column({
		name: 'Word',
		nullable: false,
		update: false
	})
	readonly word!: string;
}
