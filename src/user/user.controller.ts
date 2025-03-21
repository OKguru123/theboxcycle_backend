import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
@Controller("user")
export class UserController {
  public constructor(private userService: UserService) {}

  @Get("/")
  @UseGuards(RolesGuard)
  @Roles(2)
  private async getUser(): Promise<object> {
    return this.userService.userGetService();
  }

  @Get("/:id")
  @UseGuards(RolesGuard)
  @Roles(1)
  private async getUserById(@Param("id") id: string) {
    return this.userService.userGetByIdService(id);
  }

  // @Post('login')
  // private async userPostLogin(@Body() body): Promise<object> {
  //   return this.userService.userPostLoginService(body);
  // }

  // @Post()
  // private async userPost(@Body() body): Promise<object> {
  //   return this.userService.userPostService(body);
  // }

  // @Delete('/delete/:email')
  // private async userUpdate(@Param('email') email: string): Promise<object> {
  //   return this.userService.userDeleteService(email);
  // }

  @Post("/create")
  @UseGuards(RolesGuard)
  @Roles(2)
  private async userPost(@Body() body): Promise<object> {
    console.log("body", body);
    return this.userService.userPostService(body);
  }

  @Put("/:id")
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/user-image",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split(".").pop();
          callback(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    })
  )
  async editUser(
    @Param("id") id: string,
    @UploadedFile() file: any,
    @Body() body: any
  ) {
    const payload = { ...body };

    if (file) {
      payload.image = file.filename;
    }
    return this.userService.updateUserService(id, payload, file);
  }

  @Delete("/:id")
  @UseGuards(RolesGuard)
  @Roles(2)
  async deleteMachine(@Param("id") id: string): Promise<object> {
    return this.userService.deleteUserService(id);
  }
}
