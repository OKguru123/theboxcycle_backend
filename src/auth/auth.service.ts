import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "src/user/model/user.model";
import * as bcrypt from "bcrypt";
import * as AWS from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { randomInt } from "crypto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  private ses: AWS.SES;
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private configService: ConfigService,
    private JwtService: JwtService
  ) {
    AWS.config.update({
      accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get<string>("AWS_REGION"),
      apiVersion: this.configService.get<string>("AWS_API_VERSION"),
    });
    this.ses = new AWS.SES();
  }
  async userLoginWithPasswordService(body) {
    let data = await this.userModel.findOne({
      where: {
        email: body.email,
      },
    });
    if (data) {
      const isMatch = await bcrypt.compare(body.password, data.password);
      if (isMatch) {
        return {
          status: 200,
          success: true,
          message: "Success",
          body: {
            token: this.JwtService.sign({
              id: data.id,
              role: data.roleId,
              email: data.email,
            }),
            user: data,
          },
        };
      } else {
        return {
          status: 404,
          success: false,
          error: "Invalid email and password",
        };
      }
    } else {
      return {
        status: 404,
        success: false,
        error: "Invalid email and password",
      };
    }
  }
  async userLoginService(body) {
    let data = await this.userModel.findOne({
      where: {
        email: body.email,
        state: "active",
      },
    });
    if (data) {
      const otp = this.generateOtp(6);

      this.userModel.update(
        { authOptionId: Number(otp) },
        {
          where: {
            id: data.id,
          },
        }
      );

      const message = `Hello ${data.firstName} ${data.lastName}, \nYour one time password is ${otp}.\n\nThanks & Regards,\nThe Box Cycle Team`;
      console.log("message", message);
      // const success: boolean = await this.sendEmail(body.email, message);
      // if (!success)
      //   return {
      //     status: 404,
      //     success: false,
      //     error: 'Failed to send the mail to user',
      //     // body: {},
      //   };

      return {
        status: 200,
        success: true,
        error: `OTP send to user ${otp}`,
        //   body: { ...body },
      };
    } else {
      return {
        status: 404,
        success: false,
        error: "Invalid email please try other email",
        // body: {},
      };
    }
  }

  async userRegisterService(body) {
    body.password = await bcrypt.hash(body.password, 10);
    let data = await this.userModel.findOne({
      where: {
        email: body.email,
        state: "active",
      },
    });
    if (data)
      return {
        status: 404,
        error: "User already exists",
      };
    data = await this.userModel.findOne({
      where: {
        email: body.email,
        state: "inactive",
      },
    });

    if (data) {
      await this.userModel.destroy({
        where: {
          email: body.email,
        },
      });
      return {
        status: 404,
        error: "Please try after sometime",
      };
    }
    const otp = this.generateOtp(6);
    data = await this.userModel.create({
      ...body,
      roleId: 1,
      authOptionId: otp,
    });

    const message = `Hello ${body.name} , \nYour one time password is ${otp}.\n\nThanks & Regards,\nThe Box Cycle Team`;
    console.log("message", message);
    const success: boolean = await this.sendEmail(body.email, message);
    if (!success)
      return {
        status: 404,
        success: false,
        error: "Failed to send the mail to user",
        // body: {},
      };

    return {
      status: 200,
      success: true,
      error: `OTP send to user ${otp}`,
      //   body: { ...body },
    };
  }

  async socialLogin(body) {
    try {
      let data = await this.userModel.findOne({
        where: {
          socialId: body.socialId,
          state: "active",
        },
      });
      body.password = await bcrypt.hash(body.password, 10);
      if (data) {
        return {
          status: 200,
          success: true,
          error: "Social login successfull",
          body: data,
        };
      } else {
        if (!body.email) {
          return {
            status: 404,
            success: false,
            error: "Unable to fetch email address from the account",
          };
        }
        data = await this.userModel.create({
          ...body,
          roleId: "1",
          state: "active",
        });

        if (data) {
          return {
            status: 200,
            success: true,
            error: "Social login successfull 123",
            body: { ...body },
          };
        }
      }
    } catch (err) {
      console.log(err);
      return {
        status: 404,
        success: false,
        error: JSON.stringify(err),
        body: { ...err },
      };
    }
  }

  async sendEmail(email: string, message: string) {
    /* Email start */
    const params = {
      Destination: {
        CcAddresses: [email],
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: message,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "The Box Account OTP",
        },
      },
      Source: "no-reply@theboxcycle.com" /* required */,
      ReplyToAddresses: ["no-reply@theboxcycle.com"],
    };
    try {
      const data = await this.ses.sendEmail(params).promise();
      if (data.MessageId) return true;
      else return false;
    } catch (err) {
      console.log("error ->", err);
      return false;
    }
  }

  async userOTPService(body) {
    const { otp, email } = body;
    const data = await this.userModel.findOne({
      where: {
        authOptionId: otp,
        email,
      },
    });

    if (data) {
      const dataObj = await this.userModel.update(
        { state: "active" },
        {
          where: {
            id: data.id,
          },
        }
      );

      if (dataObj[0] > 0) {
        return {
          status: 200,
          success: true,
          message: "User Verification Success",
          body: {
            token: this.JwtService.sign({
              id: data.id,
              role: data.roleId,
              email: data.email,
            }),
            user: data,
          },
        };
      } else {
        return {
          status: 404,
          success: false,
          message: "Please try again later",
          body: {},
        };
      }
    } else {
      return {
        status: 404,
        success: false,
        message: "Wrong OTP",
        body: {},
      };
    }
  }
  async resendOTP(email: string) {
    try {
      const authOptionId = this.generateOtp(6);
      const data = await this.userModel.findOne({ where: { email } });
      if (data) {
        const { firstName, lastName } = data;
        const message = `Hello ${firstName} ${lastName}, \nYour one time password is ${authOptionId}.\n\nThanks & Regards,\nThe Box Cycle Team`;
        const res = await this.sendEmail(email, message);
        if (res) {
          data.authOptionId = parseInt(authOptionId);
          await data.save();
          return {
            status: 200,
            success: true,
          };
        } else {
          return {
            status: 404,
            success: false,
            message: "Failed to send the mail to user",
          };
        }
      } else {
        return {
          status: 404,
          success: false,
          message: "User doesn't exist",
        };
      }
    } catch (err) {
      return {
        status: 404,
        success: false,
        message: "Failed to send the mail to user",
      };
    }
  }

  async createPassword(body) {
    try {
      const { email, password, otp } = body;

      const data = await this.userModel.findOne({
        where: {
          email: email,
          authOptionId: otp,
        },
      });
      console.log("body", data);

      const myEncryptPassword = await bcrypt.hash(password, 10);

      // const dataObj = this.userModel.update(
      //   { password: myEncryptPassword },
      //   { where: { email } },
      // );

      const dataObj = await this.userModel.update(
        { password: myEncryptPassword },
        {
          where: {
            id: data.id,
          },
        }
      );

      if (dataObj[0] > 0) {
        return {
          status: 200,
          success: true,
        };
      }
      return {
        status: 404,
        success: false,
        message: "Failed to update password",
      };
    } catch (err) {
      return {
        status: 404,
        success: err,
        message: "Internal Server Error, Please try again later",
      };
    }
  }

  async updatePassword(body) {
    try {
      const { email, password, OldPassword } = body;
      const myEncryptPassword = await bcrypt.hash(password, 10);

      const data = await this.userModel.findOne({
        where: {
          email: email,
        },
      });
      console.log("data", data);
      const isMatch = await bcrypt.compare(OldPassword, data.password);
      if (isMatch) {
        const dataObj = await this.userModel.update(
          { password: myEncryptPassword },
          {
            where: {
              id: data.id,
            },
          }
        );
        if (dataObj[0] > 0) {
          return {
            status: 200,
            success: true,
          };
        } else {
          return {
            status: 404,
            success: false,
            message: "Failed to update password",
          };
        }
      } else {
        return {
          status: 404,
          success: false,
          message: "Old password not match",
        };
      }
    } catch (err) {
      return {
        status: 404,
        success: err,
        message: "Internal Server Error, Please try again later",
      };
    }
  }

  generateOtp(otpLength: number = 6): string {
    // Generate a random number with the specified number of digits
    const otp = randomInt(10 ** (otpLength - 1), 10 ** otpLength)
      .toString()
      .padStart(otpLength, "0");
    return otp;
  }
}
