import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCreditDto } from "./dto";
import { InjectModel } from "@nestjs/sequelize";
import { Credit } from "./model/credit.model";
import { User } from "src/user/model/user.model";
import axios from "axios";
import { SocketGateway } from "src/socket/socket.gateway";
import { JwtService } from "@nestjs/jwt";
const { Op } = require("sequelize");

@Injectable()
export class CreditService {
  public constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Credit) private creditModel: typeof Credit,
    private readonly socketGateway: SocketGateway,
    private readonly jwtService: JwtService
  ) {}

  private getInfo(
    email: string,
    firstName: string,
    lastName: string,
    amount: number
  ) {
    return {
      accountIdentifier: "A32268589",
      amount,
      campaign: "",
      customerIdentifier: "G05198816",
      emailSubject: "sending  e-gift card",
      externalRefID: "",
      message: "You get an exiting gift card",
      notes: "",
      recipient: {
        email,
        firstName,
        lastName,
      },
      sendEmail: true,
      sender: {
        email: "no-verify@theboxcycle.com",
        firstName: "Team",
        lastName: "",
      },
      utid: "U579023",
    };
  }

  async userAddCreditService(body: CreateCreditDto) {
    const credit = await this.creditModel.findOne({
      where: { email: body.email },
      order: [["updatedAt", "DESC"]],
    });

    const totalPoint = credit ? credit.totalPoint + body.point : body.point;
    const payload = { ...body, totalPoint };
    const data = await this.creditModel.create(payload);

    const response = {
      status: 201,
      success: true,
      message: "Credit added to user account",
      body: data,
      payload: payload,
    };

    // ✅  specific user message
    this.socketGateway.sendMessageToUser(
      body.email,
      "user_credit_added",
      response
    );

    return response;
  }

  async userDeductCreditService(email: string, deductPoints: any) {
    const userData = await this.userModel.findOne({ where: { email } });

    if (!userData) throw new BadRequestException("user not found");
    const updatedRow = await this.creditModel.findOne({
      where: {
        email,
      },
      order: [["updatedAt", "DESC"]],
    });
    if (!updatedRow) throw new BadRequestException("user credit not found");

    const leftPoints = updatedRow.totalPoint - parseInt(deductPoints);
    if (updatedRow.totalPoint < deductPoints) {
      return {
        status: 200,
        success: false,
        message: "You don't have enough credit points",
        body: {
          email,
          totalPoint: updatedRow.totalPoint,
        },
      };
    }
    const { nickName, terminalNumber, weight } = updatedRow;

    const userD = userData;
    const info = this.getInfo(
      email,
      userD.firstName,
      userD.lastName,
      parseInt(deductPoints) / 100
    );

    const headers = {
      headers: {
        Authorization: `Basic ${process.env.TANGOCARD_TOKEN.trim()}`,
      },
    };
    // const apiCall = await axios.post(
    //   'https://integration-api.tangocard.com/raas/v2/orders',
    //   info,
    //   headers,
    // );
    // if (!(apiCall && apiCall.data && apiCall.data.status === 'COMPLETE'))
    //   return {
    //     status: 200,
    //     success: false,
    //     message: 'Please try again later',
    //   };
    await this.creditModel.create({
      nickName,
      email,
      point: parseInt(deductPoints),
      totalPoint: leftPoints,
      terminalNumber,
      weight,
      materialDetails: updatedRow.materialDetails,
      transactionType: "deduct",
      transactionDetails: JSON.stringify({}),
    });

    return {
      status: 201,
      success: true,
      message: "deduct successfully",
      body: {
        deductedPoints: deductPoints,
        email,
        totalPoint: leftPoints,
      },
    };
  }

  async userGetCreditService(email: string) {
    let data: any = {},
      totalBottleCount = 0;
    const updatedRow = await this.creditModel.findOne({
      where: { email },
      order: [["updatedAt", "DESC"]],
    });
    const deposits = await this.creditModel.findAll({
      where: {
        email,
        transactionType: "add",
      },
    });
    const userData = await this.userModel.findOne({ where: { email } });

    if (deposits.length > 0) {
      const dData = deposits;
      dData.forEach((row) => {
        const bottleCount = Number(row.transactionDetails);
        totalBottleCount += bottleCount;
      });
    }

    let isSocial = false;
    if (updatedRow) {
      if (userData) {
        if (userData.socialId) isSocial = true;
        data = {
          ...userData,
          totalCreditPoints: updatedRow.totalPoint,
          deposits: totalBottleCount,
          isSocial: isSocial,
        };
      }
    } else {
      if (userData.socialId) isSocial = true;
      if (userData) {
        data = {
          ...userData,
          deposits: totalBottleCount,
          isSocial: isSocial,
        };
      }
    }
    return {
      status: 200,
      message: data.totalCreditPoints
        ? "Total credit points"
        : "No points available for the user",
      body: data,
    };
  }
  async getTotalPoints(email: string): Promise<object> {
    console.log("request for the credit");
    try {
      const credit = await this.creditModel.findOne({
        where: {
          email: email,
        },
        order: [["updatedAt", "DESC"]],
      });

      return {
        status: 200,
        message: "Success",
        totalPoints: credit?.totalPoint ? credit?.totalPoint : 0,
      };
    } catch (err) {
      return {
        status: 500,
        message: "Error calculating total points",
        error: err,
      };
    }
  }

  async getDeductCredit(): Promise<object> {
    try {
      const credit = await this.creditModel.findAll({
        where: {
          transactionType: "deduct",
        },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: [
            "materialDetails",
            "transactionDetails",
            "createdAt",
            "updatedAt",
            "terminalNumber",
            "weight",
          ],
        },
      });

      return {
        status: 200,
        message: "Success",
        data: credit,
      };
    } catch (err) {
      return {
        status: 500,
        message: "Error, please try again",
        error: err,
      };
    }
  }

  async getGiftRequestCount() {
    return this.creditModel.count({ where: { transactionType: "deduct" } });
  }

  async getGiftRequestCountByMonth(start, end) {
    return this.creditModel.count({
      where: {
        transactionType: "deduct",
        createdAt: {
          [Op.between]: [start, end],
        },
      },
    });
  }

  async getCountByMatreial(type: string) {
    return this.creditModel.count({
      where: { materialDetails: type, transactionType: "add" },
    });
  }

  async getMatreialCountByMonth(start, end) {
    return this.creditModel.count({
      where: {
        transactionType: "add",
        createdAt: {
          [Op.between]: [start, end],
        },
      },
    });
  }

  async getMatreialAllCount() {
    return this.creditModel.count({
      where: {
        transactionType: "add",
      },
    });
  }

  async getCredit() {
    const resp1 = await this.creditModel.sum("point", {
      where: {
        transactionType: "add",
      },
    });

    const resp2 = await this.creditModel.sum("point", {
      where: {
        transactionType: "deduct",
      },
    });
    return resp1 - resp2;
  }
}
