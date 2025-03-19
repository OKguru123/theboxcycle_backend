import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { MaterialDetails } from "./model/material-details.model";
import { UpdateMaterialDto } from "./dto/update-material.dto";

@Injectable()
export class MaterialDetailsService {
  constructor(
    @InjectModel(MaterialDetails)
    private materialDetailsModel: typeof MaterialDetails
  ) {}
  // src/material-details/material-details.service.ts
  async getMaterialDetails(): Promise<MaterialDetails> {
    let material = await this.materialDetailsModel.findOne();
    if (!material) {
      // Optionally create a default record if none exists.
      material = await this.materialDetailsModel.create({
        aluminum: 0,
        plastic: 0,
        glass: 0,
      });
    }
    return material;
  }

  async updateMaterialCount(
    updateMaterialDto: UpdateMaterialDto
  ): Promise<MaterialDetails> {
    // Try to fetch the common record (assuming there is only one record)
    let material = await this.materialDetailsModel.findOne();
    if (!material) {
      // If not found, create a new record with default values
      material = await this.materialDetailsModel.create({
        aluminum: 0,
        plastic: 0,
        glass: 0,
      });
    }
    // Add the new values to the existing counts
    material.aluminum = material.aluminum + updateMaterialDto.aluminum;
    material.plastic = material.plastic + updateMaterialDto.plastic;
    material.glass = material.glass + updateMaterialDto.glass;

    return await material.save();
  }
}
