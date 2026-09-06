import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../../infrastructure/security/roles.decorator';
import { UserRole } from '@evaluateme/domain';
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import { CreateCustomQuizUseCase } from '../../application/corporate/quizzes/create-custom-quiz.use-case';
import { CreatePersonalQuizUseCase } from '../../application/corporate/quizzes/create-personal-quiz.use-case';
import { ListCompanyQuizzesUseCase } from '../../application/corporate/quizzes/list-company-quizzes.use-case';
import {
  createCustomQuizSchema,
  CreateCustomQuizDto,
  createPersonalQuizSchema,
  CreatePersonalQuizDto,
  listCompanyQuizzesSchema,
  ListCompanyQuizzesDto,
} from '../../lib/schemas/corporate.schema';
import { GetUser } from '../../infrastructure/auth/get-user.decorator';

interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
}

@Controller('/api/v1/corporate/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
export class QuizzesController {
  constructor(
    private readonly createCustomQuizUseCase: CreateCustomQuizUseCase,
    private readonly createPersonalQuizUseCase: CreatePersonalQuizUseCase,
    private readonly listCompanyQuizzesUseCase: ListCompanyQuizzesUseCase,
  ) {}

  @Post('custom')
  async createCustom(
    @Body(new ZodValidationPipe(createCustomQuizSchema)) dto: CreateCustomQuizDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<CreateCustomQuizUseCase['execute']>> {
    return this.createCustomQuizUseCase.execute({
      userId: user.sub,
      companyId: dto.companyId,
      name: dto.name,
      description: dto.description ?? null,
      questionIds: dto.questionIds,
    });
  }

  @Post('personal')
  async createPersonal(
    @Body(new ZodValidationPipe(createPersonalQuizSchema)) dto: CreatePersonalQuizDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<CreatePersonalQuizUseCase['execute']>> {
    return this.createPersonalQuizUseCase.execute({
      userId: user.sub,
      companyId: dto.companyId,
      name: dto.name,
      description: dto.description ?? null,
      questions: dto.questions,
    });
  }

  @Get()
  async list(
    @Query(new ZodValidationPipe(listCompanyQuizzesSchema)) query: ListCompanyQuizzesDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<ListCompanyQuizzesUseCase['execute']>> {
    return this.listCompanyQuizzesUseCase.execute({
      userId: user.sub,
      companyId: query.companyId,
    });
  }
}
