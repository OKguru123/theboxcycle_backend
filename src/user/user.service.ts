import { Injectable } from "@nestjs/common";
import { User } from "./model/user.model";
import { InjectModel } from "@nestjs/sequelize";
import { Credit } from "src/credit/model/credit.model";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
const fs = require("fs");
const { Op } = require("sequelize");
@Injectable()
export class UserService {
  public constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Credit) private creditmodel: typeof Credit,
    private JwtService: JwtService
  ) {}
  // public async getUsers(): Promise<User[]> {
  //   return await this.userModel.findAll();
  // }

  async userPostService(body) {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      state,
      roleId,
      authOptionId,
    } = body;
    body.password = await bcrypt.hash(password, 10);
    try {
      console.log("state", state);
      await this.userModel.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        state: state.toLowerCase(),
        roleId: roleId,
        authOptionId,
        password: await bcrypt.hash(password, 10),
      });

      return {
        status: 201,
        message: "new user is added",
        body: {
          ...body,
          point: 2000,
        },
      };
    } catch (err) {
      return {
        status: 404,
        message: "user already exist",
        body: {
          email,
        },
      };
    }
  }

  async userPostLoginService(body) {
    try {
      const { email, password } = body;
      const data = await this.userModel.findOne({
        where: {
          email,
          state: "active",
        },
      });

      if (!data) throw new Error("user not found");
      const isCorrectPassword = await bcrypt.compare(password, data.password);
      if (isCorrectPassword) {
        return {
          status: 201,
          message: "login success",
          body: data,
        };
      } else {
        throw new Error("user not found");
      }
    } catch (err) {
      return {
        status: 404,
        message: err.message,
        body,
      };
    }
  }

  // async userUpdateService(body) {
  //   try {
  //     //for update user
  //   } catch (err) {}
  // }

  async userDeleteService(email) {
    try {
      await this.userModel.destroy({ where: { email } });
      return {
        status: 200,
        message: "User has been deleted sucessfully",
        body: {
          email,
        },
      };
    } catch (err) {
      return {
        status: 404,
        message: "user didn't exist",
        body: {
          email,
        },
      };
    }
  }

  async userGetService() {
    try {
      const data = await this.userModel.findAll({
        attributes: {
          exclude: [
            "password",
            "authOptionId",
            "image",
            "createdAt",
            "updatedAt",
          ],
        },
      });
      return data;
    } catch (err) {
      return {
        status: 400,
        message: "users not found",
        body: {},
      };
    }
  }

  async updateUserService(id: string, body: any, file: any) {
    console.log(id, body);

    try {
      const user = await this.userModel.findByPk(id, {
        attributes: {
          exclude: ["password", "authOptionId", "createdAt", "updatedAt"],
        },
      });
      if (file) {
        fs.unlink(
          `${__dirname.split("dist")[0]}/uploads/user-image/${user.image}`,
          () => {}
        );
      }
      if (!user) {
        return {
          status: 404,
          message: "User not found",
        };
      }
      await user.update(body);
      return {
        status: 200,
        message: "User successfully updated",
        body: user,
        token: this.JwtService.sign(
          { id: user.id, role: user.roleId, email: user.email },
          {
            secret: process.env.JWT_SECRET,
          }
        ),
      };
    } catch (err) {
      return {
        status: 404,
        message: "User not updated. Please try again",
      };
    }
  }

  async userGetByIdService(id: string) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }
    return {
      status: 200,
      message: "User successfully updated",
      body: user,
    };
  }
  async getUserService(id: string) {
    const user = await this.userModel.findByPk(id);
    return user;
  }

  async deleteUserService(id: string) {
    try {
      const user = await this.userModel.findByPk(id);
      fs.unlink(
        `${__dirname.split("dist")[0]}/uploads/user-image/${user.image}`,
        () => {}
      );
      if (!user) {
        return {
          status: 404,
          message: "User not found",
        };
      }
      await user.destroy();
      return {
        status: 200,
        message: "User successfully deleted",
      };
    } catch (err) {
      return {
        status: 404,
        message: "User not deleted. Please try again",
      };
    }
  }

  async createUser(body) {
    const { firstName, lastName, email, phoneNumber } = body;
    const password = await bcrypt.hash(body.password, 10);
    try {
      await this.userModel.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        roleId: 1,
        password,
        state: "active",
      });
      delete body.password;
      return {
        status: 201,
        message: "new user is added",
        body: {
          ...body,
          point: 2000,
        },
      };
    } catch (err) {
      return {
        status: 404,
        message: "user already exist",
        body: {
          email,
        },
      };
    }
  }

  async getUserCount(state) {
    return this.userModel.count({ where: { state: state } });
  }

  async getThisMonthUserCount(start, end) {
    return this.userModel.count({
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
    });
  }
}
