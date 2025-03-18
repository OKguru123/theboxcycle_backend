import { Module } from '@nestjs/common';
import { MachineController } from './machine.controller';
import { MachineService } from './machine.service';
import { Machine } from './model/machine.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports:[SequelizeModule.forFeature([Machine])],
    controllers: [MachineController],
    providers: [MachineService, RolesGuard,JwtService],
    exports:[MachineService]
  })
export class MachineModule {}
