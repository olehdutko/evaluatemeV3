import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { GetPublicResultByCodeUseCase } from '../../application/public-info/get-public-result-by-code.use-case';

@Controller('/api/v1/public/results')
export class PublicResultController {
  constructor(private readonly getPublicResultByCodeUseCase: GetPublicResultByCodeUseCase) {}

  @Get(':resultCode')
  @HttpCode(HttpStatus.OK)
  async get(@Param('resultCode') resultCode: string) {
    return this.getPublicResultByCodeUseCase.execute(resultCode);
  }
}
