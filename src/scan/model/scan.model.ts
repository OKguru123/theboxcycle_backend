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

@Table({ tableName: 'qr_code_scan' })
export class QRCodeScan extends Model<QRCodeScan> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  QRCode: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  DeviceID: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  IsRead: boolean;
}
