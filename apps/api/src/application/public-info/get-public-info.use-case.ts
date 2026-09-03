import { Injectable, Inject } from '@nestjs/common';
import {
  ICreditSettingRepository,
  IHealthRepository,
  ITechnologyRepository,
  IUserRepository,
  IQuestionRepository,
  IQuizSessionRepository,
} from '@evaluateme/domain';

interface PublicInfoData {
  creditSettings: Record<string, string>;
  counters: {
    technologies: number;
    users: number;
    questions: number;
    testsPassed: number;
  };
}

@Injectable()
export class GetPublicInfoUseCase {
  constructor(
    @Inject(ICreditSettingRepository) private readonly creditSettingRepository: ICreditSettingRepository,
    @Inject(IHealthRepository) private readonly healthRepository: IHealthRepository,
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
  ) {}

  async execute(): Promise<{ success: true; data: PublicInfoData }> {
    await this.healthRepository.check();

    const [creditSettingsRows, technologies, users, questions, sessions] = await Promise.all([
      this.creditSettingRepository.findAll(),
      this.technologyRepository.findAll(),
      this.userRepository.findAll(),
      this.questionRepository.findAll(),
      this.quizSessionRepository.findAll(),
    ]);

    const creditSettings: Record<string, string> = {};
    for (const row of creditSettingsRows) {
      creditSettings[row.key] = row.value;
    }

    const testsPassed = Array.isArray(sessions) ? sessions.filter((s) => s.status === 'completed').length : 0;

    return {
      success: true,
      data: {
        creditSettings,
        counters: {
          technologies: technologies.length,
          users: users.length,
          questions: questions.length,
          testsPassed,
        },
      },
    };
  }
}
