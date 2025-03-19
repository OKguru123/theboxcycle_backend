import { Controller, Put, Body } from "@nestjs/common";
import { MaterialDetailsService } from "./material-details.service";
import { UpdateMaterialDto } from "./dto/update-material.dto";
import { MaterialDetails } from "./model/material-details.model";

@Controller("material-details")
export class MaterialDetailsController {
  constructor(
    private readonly materialDetailsService: MaterialDetailsService
  ) {}

  @Put()
  async updateMaterial(
    @Body() updateMaterialDto: UpdateMaterialDto
  ): Promise<MaterialDetails> {
    return await this.materialDetailsService.updateMaterialCount(
      updateMaterialDto
    );
  }
}
