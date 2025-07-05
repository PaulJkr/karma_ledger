import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { User } from 'src/users/models/users.model';
@Table({ tableName: 'karma_suggestions', timestamps: true })
export class Suggestion extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  user_id: string;

  @Column(DataType.TEXT)
  suggestion_text: string;

  @Column(DataType.INTEGER)
  week: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  used: boolean;

  @Column(DataType.DATE)
  created_at: Date;

  @BelongsTo(() => User)
  user: User;
}
