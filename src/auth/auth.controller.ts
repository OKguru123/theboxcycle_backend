import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/login')
  async postLogin(@Body() body): Promise<object> {
    return await this.authService.userLoginService(body);
  }

  @Post('/login-with-password')
  async loginWithPassword(@Body() body): Promise<object> {
    console.log("body",body);
    return await this.authService.userLoginWithPasswordService(body);
  }
  
  @Post('/register')
  async userRegister(@Body() body): Promise<object> {
    console.log("body",body);
    return await this.authService.userRegisterService(body);
  }
  @Post('/otp-verify')
  async userOTPVerify(@Body() body): Promise<object> {
    return await this.authService.userOTPService(body);
  }

  @Post('/resend-otp')
  async userResendOTP(@Body() body): Promise<object> {
    return await this.authService.resendOTP(body);
  }
  @Post('/create-password')
  async userCreatePassword(@Body() body): Promise<object> {
    return await this.authService.createPassword(body);
  }

  @Post('/update-password')
  @UseGuards(RolesGuard)
  @Roles(1) 
  async userUpdatePassword(@Body() body): Promise<object> {
    return await this.authService.updatePassword(body);
  }
  
  @Post('/social-login')
  async userSocialLogin(@Body() body): Promise<object> {
    return await this.authService.socialLogin(body);
  }
}
