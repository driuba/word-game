import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import Channel from './channel';
import Word from './word';

@Entity({ name: 'Users' })
export default class User extends BaseEntity {
  @ManyToMany(
    () => Channel,
    c => c.users,
    {
      cascade: ['insert'],
      nullable: false,
      onDelete: 'CASCADE'
    }
  )
  channels!: Channel[];

  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Column({
    length: 50,
    name: 'UserId',
    nullable: false,
    unique: true
  })
  userId!: string;

  @OneToMany(() => Word, w => w.creator)
  wordsCreated!: Word[];
  
  @OneToMany(() => Word, w => w.guesser)
  wordsGuessed!: Word[];
}
