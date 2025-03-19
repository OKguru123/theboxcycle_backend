import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
} from "sequelize-typescript";

@Table({ tableName: "material_details" })
export class MaterialDetails extends Model<MaterialDetails> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  id: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  aluminum: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  plastic: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  glass: number;
}
