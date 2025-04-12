import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import Channel from './channel';
import User from './user';

@Entity({ name: 'Words' })
export default class Word extends BaseEntity {
  @JoinColumn({ name: 'ChannelId' })
  @ManyToOne(
    () => Channel,
    c => c.words,
    {
      nullable: false,
      onDelete: 'CASCADE'
    }
  )
  channel!: Channel;

  @CreateDateColumn({
    name: 'Created',
    nullable: false
  })
  created!: Date;

  @JoinColumn({ name: 'UserIdCreator' })
  @ManyToOne(
    () => User,
    u => u.wordsCreated,
    {
      nullable: false,
      onDelete: 'CASCADE'
    }
  )
  creator!: User;

  @JoinColumn({ name: 'UserIdGuesser' })
  @ManyToOne(
    () => User,
    u => u.wordsGuessed,
    {
      onDelete: 'SET NULL'
    }
  )
  guesser?: User;

  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Column({
    default: 0,
    name: 'Score',
    nullable: false
  })
  score!: number;

  @UpdateDateColumn({ name: 'Modified' })
  modified?: Date;

  @Column({
    name: 'Word',
    nullable: false
  })
  word!: string;
}
