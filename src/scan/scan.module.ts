import { Module } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { QRCodeScan } from './model/scan.model';
import { SocketGateway } from 'src/socket/socket.gateway';
import { JwtModule } from '@nestjs/jwt';
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
  SequelizeModule.forFeature([QRCodeScan])],
  controllers: [ScanController],
  providers: [ScanService, SocketGateway],
})
export class ScanModule {}
