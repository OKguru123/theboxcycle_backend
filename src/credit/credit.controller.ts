import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CreditService } from "./credit.service";
import { CreateCreditDto, DeductCreditDto } from "./dto";
import { Credit } from "./model/credit.model";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";

@Controller("credit")
export class CreditController {
  constructor(private creditService: CreditService) {}
  @Get("/count/")
  @UseGuards(RolesGuard)
  @Roles(1)
  async getCreditCount(@Request() request): Promise<Credit | unknown> {
    return await this.creditService.getTotalPoints(request.user.email);
  }

  @Post("add")
  async addCredit(@Body() body: CreateCreditDto): Promise<object> {
    return await this.creditService.userAddCreditService(body);
  }

  /* @Get('/:email')
  @UseGuards(RolesGuard)
  @Roles(1)
  async findOne(@Param('email') email: string): Promise<Credit | unknown> {
    return await this.creditService.userGetCreditService(email);
  }*/

  @Post("deduct")
  @UseGuards(RolesGuard)
  @Roles(1)
  async deductCredit(@Body() body: DeductCreditDto): Promise<Credit | unknown> {
    return await this.creditService.userDeductCreditService(
      body.email,
      body.deductPoints
    );
  }

  @Get("deduct")
  @UseGuards(RolesGuard)
  @Roles(2)
  async getDeductCredit(): Promise<Credit | unknown> {
    return await this.creditService.getDeductCredit();
  }

  @Get("/:email")
  @UseGuards(RolesGuard)
  @Roles(1)
  async findOne(@Param("email") email: string): Promise<Credit | unknown> {
    return await this.creditService.userGetCreditService(email);
  }

  //   @Put()
  //   @HttpCode(204)
  //   async updateOne(@Body() body: UpdateCreditDto): Promise<Credit | {}> {
  //     return await this.creditService.updateOne(body);
  //   }
}
