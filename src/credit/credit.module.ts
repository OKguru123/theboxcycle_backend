import { forwardRef, Module } from '@nestjs/common';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Credit } from './model/credit.model';
import { UserModule } from 'src/user/user.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { SocketGateway } from 'src/socket/socket.gateway';

@Module({
  imports: [SequelizeModule.forFeature([Credit]), forwardRef(() => UserModule)],
  controllers: [CreditController],
  providers: [CreditService, RolesGuard, JwtService, SocketGateway],
  exports: [SequelizeModule,CreditService],
})
export class CreditModule { }
