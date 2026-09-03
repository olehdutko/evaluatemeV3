import { Controller, Get } from '@nestjs/common';
import { GetPublicInfoUseCase } from '../../application/public-info/get-public-info.use-case';

@Controller('/api/v1/public-info')
export class PublicInfoController {
  constructor(private readonly getPublicInfoUseCase: GetPublicInfoUseCase) {}

  @Get()
  async getPublicInfo(): Promise<ReturnType<GetPublicInfoUseCase['execute']>> {
    return this.getPublicInfoUseCase.execute();
  }
}
