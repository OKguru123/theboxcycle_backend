import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { CreateScanDto, UpdateScanDto } from './dto';
import { ScanService } from './scan.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('scan')
export class ScanController {
  public constructor(private scanService: ScanService) {}
  @Get('/:QR')
  private async get(@Param('QR') qrCode: string): Promise<object> {
    return await this.scanService.findOne(qrCode);
  }
  @Post()
  private async create(@Body() body: CreateScanDto): Promise<object> {
    return await this.scanService.create(body);
  }

  @Put()
  private async update(@Body() body: UpdateScanDto): Promise<object> {
    return await this.scanService.updateOne(body);
  }

  @Post('/open')
  @UseGuards(RolesGuard)
  @Roles(1) 
  private async openMachine(@Request() request,@Body() body: any): Promise<object> {
    return await this.scanService.openMachine(request.user.email,body.QRCode);
  }
}
