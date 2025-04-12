import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import User from './user';
import Word from './word';

@Entity({ name: 'Channels' })
export default class Channel extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Column({
    length: 50,
    name: 'ChannelId',
    nullable: false,
    unique: true
  })
  channelId!: string;

  @JoinTable({
    name: 'ChannelUsers',
    inverseJoinColumn: {
      name: 'UserId'
    },
    joinColumn: {
      name: 'ChannelId'
    }
  })
  @ManyToMany(
    () => User,
    u => u.channels,
    {
      cascade: ['insert'],
      nullable: false,
      onDelete: 'CASCADE',
    }
  )
  users!: User[];

  @OneToMany(() => Word, w => w.channel)
  words!: Word[];
}
