import { Body, Controller, Get, Post, UseGuards, UseInterceptors,UploadedFile, Query, Put, Param, Delete } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MachineService } from './machine.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';


@Controller('machine')
export class MachineController {
  public constructor(private machineService: MachineService) {}

  @Get('/')
  @UseGuards(RolesGuard)
  @Roles(2) 
  private async getMachine(): Promise<object> {
      return this.machineService.machineGetService();
  }

  @Get('/list')
  @UseGuards(RolesGuard)
  @Roles(1) 
  private async getMachineUser(@Query('limit') limit: number,@Query('page') page: number): Promise<object> {
      return this.machineService.machineGetServiceByLimit(page,limit);
  }

  @UseGuards(RolesGuard)
  @Roles(2) 
  @Post('/')
  @UseInterceptors(FileInterceptor('file', {
     storage: diskStorage({
       destination: './uploads',
       filename: (req, file, callback) => {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
         const extension = file.originalname.split('.').pop();
         callback(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
       }
     }),
     limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
   }))
   uploadFile(@UploadedFile() file: any,@Body() body) {
     const payload = {...body,image:file.filename}
     return this.machineService.createMachineService(payload);;
   }

   @Put('/:id')
   @UseGuards(RolesGuard)
   @Roles(2) 
   @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const extension = file.originalname.split('.').pop();
          callback(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
        }
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }))
   async editMachine(
     @Param('id') id: string, 
     @UploadedFile() file: any, 
     @Body() body: any
   ) {
     const payload = { ...body };
     
     if (file) {
       payload.image = file.filename;
     }
     return this.machineService.updateMachineService(id, payload,file);
   }

   @Delete('/:id')
   @UseGuards(RolesGuard)
   @Roles(2) 
   async deleteMachine(@Param('id') id: string): Promise<object> {
     return this.machineService.deleteMachineService(id);
   }

}
