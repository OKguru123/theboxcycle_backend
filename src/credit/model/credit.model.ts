import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  PrimaryKey,
  Table,
  Model,
} from "sequelize-typescript";

@Table({ tableName: "credit-details" })
export class Credit extends Model<Credit> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  nickName: string;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.INTEGER)
  point: number;

  @Column(DataType.INTEGER)
  totalPoint: number;

  @Column(DataType.INTEGER)
  terminalNumber: number;

  @Column(DataType.STRING)
  weight: string;

  @Column(DataType.STRING)
  materialDetails: string;

  @Column(DataType.STRING)
  transactionDetails: string;

  @Column(DataType.STRING)
  transactionType: string;
}
