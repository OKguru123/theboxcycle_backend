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
  
  @Table({ tableName: 'machines' })
  export class Machine extends Model<Machine> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;
  
    @Default('-')
    @Column(DataType.STRING)
    image: string;
  
    @Default('-')
    @Column(DataType.STRING)
    title: string;
  
    @Default('-')
    @Column(DataType.STRING)
    number: string;
  
    @Default('-')
    @Column(DataType.STRING)
    latitude: string;
  
    @Column(DataType.STRING)
    longitude: string;
  }
  