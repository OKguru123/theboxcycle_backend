import { Controller, Get } from "@nestjs/common";
import { CreditService } from "src/credit/credit.service";
import { MachineService } from "src/machine/machine.service";
import { UserService } from "src/user/user.service";
import { MaterialDetailsService } from "src/material-details/material-details.service";

@Controller("dashboard")
export class DashboardController {
  constructor(
    private userService: UserService,
    private machineService: MachineService,
    private creditService: CreditService,
    private materialDetailsService: MaterialDetailsService
  ) {}
  @Get()
  async getAll() {
    const currentDate = new Date();
    const materialDetails =
      await this.materialDetailsService.getMaterialDetails();

    return {
      activeUser: await this.userService.getUserCount("active"),
      inActiveUser: await this.userService.getUserCount("inactive"),
      userThisMonth: await this.userService.getThisMonthUserCount(
        new Date(new Date().getFullYear(), new Date().getMonth(), 2),
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      ),
      userLastMonth: await this.userService.getThisMonthUserCount(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
      ),
      machine: await this.machineService.getMachineCount(),
      giftRequest: await this.creditService.getGiftRequestCount(),
      giftThisMonthRequest: await this.creditService.getGiftRequestCountByMonth(
        new Date(new Date().getFullYear(), new Date().getMonth(), 2),
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      ),
      giftLastMonthRequest: await this.creditService.getGiftRequestCountByMonth(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
      ),
      totalCreditScore: await this.creditService.getCredit(),
      materialPlastic: materialDetails.plastic,
      materialaluminium: materialDetails.aluminum,
      materialGlass: materialDetails.glass,
      materialThisMonth: await this.creditService.getMatreialCountByMonth(
        new Date(new Date().getFullYear(), new Date().getMonth(), 2),
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      ),
      materialThisLast: await this.creditService.getMatreialCountByMonth(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
      ),
      materialTotal: await this.creditService.getMatreialAllCount(),
    };
  }
}
