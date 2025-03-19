import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { MaterialDetails } from "./model/material-details.model";
import { MaterialDetailsController } from "./material-details.controller";
import { MaterialDetailsService } from "./material-details.service";

@Module({
  imports: [SequelizeModule.forFeature([MaterialDetails])],
  controllers: [MaterialDetailsController],
  providers: [MaterialDetailsService],
  exports: [MaterialDetailsService],
})
export class MaterialDetailsModule {}
