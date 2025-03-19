import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Machine } from "./model/machine.model";
const fs = require("fs");
@Injectable()
export class MachineService {
  public constructor(
    @InjectModel(Machine) private machineModel: typeof Machine
  ) {}

  async machineGetService() {
    try {
      const data = await this.machineModel.findAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      if (data.length > 0) {
        return {
          status: 200,
          message: "Success",
          body: data,
        };
      } else {
        return {
          status: 404,
          message: "Machine not found",
          body: {},
        };
      }
    } catch (err) {
      return {
        status: 404,
        message: "Machine not found",
        body: {},
      };
    }
  }
  async machineGetServiceByLimit(page: number, limit: number) {
    const offset = (page - 1) * limit;
    console.log(offset);
    try {
      const data = await this.machineModel.findAll({
        limit: limit,
        offset: offset,
      });

      if (data.length > 0) {
        return {
          status: 200,
          message: "Success",
          body: data,
        };
      } else {
        return {
          status: 404,
          message: "Machine not found",
          body: {},
        };
      }
    } catch (err) {
      return {
        status: 404,
        message: "Machine not found",
        body: {},
      };
    }
  }

  async createMachineService(body) {
    try {
      await this.machineModel.create(body);
      return {
        status: 201,
        message: "Machine Successfully Created",
        body: {
          ...body,
          point: 2000,
        },
      };
    } catch (err) {
      return {
        status: 404,
        message: "Machine not created. please try again",
      };
    }
  }

  async updateMachineService(id: string, body: any, file: any) {
    console.log(id, body);

    try {
      const machine = await this.machineModel.findByPk(id);
      if (file) {
        fs.unlink(
          `${__dirname.split("dist")[0]}/uploads/${machine.image}`,
          () => {}
        );
      }
      if (!machine) {
        return {
          status: 404,
          message: "Machine not found",
        };
      }
      await machine.update(body);
      return {
        status: 200,
        message: "Machine successfully updated",
        body: machine,
      };
    } catch (err) {
      return {
        status: 404,
        message: "Machine not updated. Please try again",
      };
    }
  }

  async deleteMachineService(id: string) {
    try {
      const machine = await this.machineModel.findByPk(id);
      fs.unlink(
        `${__dirname.split("dist")[0]}/uploads/${machine.image}`,
        () => {}
      );
      if (!machine) {
        return {
          status: 404,
          message: "Machine not found",
        };
      }
      await machine.destroy();
      return {
        status: 200,
        message: "Machine successfully deleted",
      };
    } catch (err) {
      return {
        status: 404,
        message: "Machine not deleted. Please try again",
      };
    }
  }
  async getMachineCount() {
    return this.machineModel.count();
  }
}
