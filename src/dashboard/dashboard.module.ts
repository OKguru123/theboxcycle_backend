import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { UserModule } from "src/user/user.module";
import { MachineModule } from "src/machine/machine.module";
import { CreditModule } from "src/credit/credit.module";
import { MaterialDetailsModule } from "src/material-details/material-details.module";

@Module({
  imports: [UserModule, MachineModule, CreditModule, MaterialDetailsModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
