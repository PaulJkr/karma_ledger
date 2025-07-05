// src/users/models/user_badge.model.ts

import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
} from 'sequelize-typescript';
import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import { Badge } from 'src/dashboard/models/badge.model';
import { User } from './users.model';

@Table({ tableName: 'user_badges' })
export class UserBadge extends Model<
  InferAttributes<UserBadge>,
  InferCreationAttributes<UserBadge>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  user_badge_id: CreationOptional<string>;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  user_id: string;

  @ForeignKey(() => Badge)
  @Column(DataType.UUID)
  badge_id: string;

  @BelongsTo(() => User)
  user?: User;

  @BelongsTo(() => Badge)
  badge?: Badge;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  awarded_at: CreationOptional<Date>;

  @CreatedAt
  created_at: CreationOptional<Date>;

  @UpdatedAt
  updated_at: CreationOptional<Date>;
}
