import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './model/user.model';

import { CreditModule } from 'src/credit/credit.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
      },
    }),
  }),
  SequelizeModule.forFeature([User]), forwardRef(() => CreditModule)],
  controllers: [UserController],
  providers: [UserService, RolesGuard,JwtService],
  exports: [SequelizeModule,UserService],
})
export class UserModule {}
