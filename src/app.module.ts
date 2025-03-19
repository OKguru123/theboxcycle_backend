import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserModule } from "./user/user.module";
import { ScanModule } from "./scan/scan.module";
import { CreditModule } from "./credit/credit.module";
import { RolesGuard } from "./common/guards/roles.guard";
import { JwtModule } from "@nestjs/jwt";
import { MachineModule } from "./machine/machine.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { DashboardModule } from "./dashboard/dashboard.module";
// import { MaterialDetails } from './material-details/model/material-details.model';
import { MaterialDetailsModule } from "./material-details/material-details.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"), // <-- path to your static files
      serveRoot: "/static", // <-- path to serve the static files, e.g. http://localhost:3000/static/images/logo.png
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN"),
        },
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: "postgres",
        host: configService.get("DB_HOST"),
        port: 5432,
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        autoLoadModels: true,
        logging: false,
        // synchronize: true,
        database: configService.get("DB_NAME"),
        // models: [User],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    ScanModule,
    CreditModule,
    MachineModule,
    DashboardModule,
    MaterialDetailsModule,
  ],
  controllers: [AppController],
  providers: [
    RolesGuard,
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
