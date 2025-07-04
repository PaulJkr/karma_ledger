import {
  Column,
  Table,
  Model,
  DataType,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { KarmaEvent } from 'src/karma_event/karma_event.model';
import { HasMany } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  user_id: string;

  @Column
  username: string;

  @Column
  email: string;

  @Column
  password: string;

  @HasMany(() => KarmaEvent)
  karmaEvents: KarmaEvent[];
}
