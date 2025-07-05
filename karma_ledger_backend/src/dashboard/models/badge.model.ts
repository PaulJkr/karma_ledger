import {
  Column,
  DataType,
  Model,
  Table,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';

@Table({ tableName: 'badge_definitions', timestamps: false })
export class Badge extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  badge_id: string;

  @Column({ type: DataType.STRING, unique: true })
  code: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.STRING)
  icon: string;

  @Column({ defaultValue: false })
  is_active: boolean;
}
