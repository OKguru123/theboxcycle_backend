import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QRCodeScan } from './model/scan.model';
import { CreateScanDto, UpdateScanDto } from './dto';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class ScanService {
  public constructor(
    @InjectModel(QRCodeScan) private qrCodeScanModel: typeof QRCodeScan,
    private readonly socketGateway: SocketGateway,
  ) { }

  async create(body: CreateScanDto) {
    const { QRCode, email } = body;
    let responseMessage: string = '';
    const scan = await this.qrCodeScanModel.findOne({ where: { QRCode } });
    const scanned: QRCodeScan = QRCodeScan.build({
      QRCode,
      DeviceID: email,
      IsRead: true,
    });
    if (scan) {
      await this.qrCodeScanModel.update(scanned, { where: { id: scan.id } });
      responseMessage = 'updated';
    } else {
      await scanned.save();
      responseMessage = 'created';
    }
    // need to send the socket message from here
    this.socketGateway.sendMessage('open_gate', {
      email: email,
      isOpenDoor: true,
      qr: body.QRCode,
    });

    return {
      status: 200,
      success: true,
      message: responseMessage,
      body: scanned,
    };
  }

  async openMachine(email: string, QRCode:string) {
    this.socketGateway.sendMessage('open_gate', {
      email: email,
      isOpenDoor: true,
      qr: QRCode,
    });

    return {
      status: 200,
      success: true,
      message: 'success',
    };
  }

  async updateOne(body: UpdateScanDto) {
    const QRCode = body.QRCode;
    let scan = await this.qrCodeScanModel.findOne({ where: { QRCode } });
    scan.IsRead = body.IsRead;
    scan = await scan.save();

    return { id: scan.id, success: true };
  }

  async findOne(QRCode: string) {
    const scannedQr = await this.qrCodeScanModel.findOne({ where: { QRCode } });
    if (scannedQr) {
      return {
        status: 200,
        success: true,
        message: 'Found',
        body: {
          Active: scannedQr,
        },
      };
    } else {
      return {
        status: 404,
        success: false,
        message: 'Not Found',
        body: {},
      };
    }
  }
}
