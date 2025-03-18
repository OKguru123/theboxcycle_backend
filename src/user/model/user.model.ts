import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  id: number;

  @Default('-')
  @Column(DataType.STRING)
  firstName: string;

  @Default('-')
  @Column(DataType.STRING)
  lastName: string;

  @Default('-')
  @Column(DataType.STRING)
  email: string;

  @Default('-')
  @Column(DataType.STRING)
  phoneNumber: string;

  @Column(DataType.STRING)
  password: string;

  @Default(0)
  @Column(DataType.INTEGER)
  roleId: number;

  @Default('inactive')
  @Column(DataType.STRING)
  state: string;

  @Default(0)
  @Column(DataType.BIGINT)
  authOptionId: number;

  @Column(DataType.STRING)
  socialId: string;
  
  @Default('-')
  @Column(DataType.STRING)
  image: string;
}
