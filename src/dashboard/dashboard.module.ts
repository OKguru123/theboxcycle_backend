import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UserModule } from 'src/user/user.module';
import { MachineModule } from 'src/machine/machine.module';
import { CreditModule } from 'src/credit/credit.module';

@Module({
  imports: [UserModule,MachineModule,CreditModule],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {

}
