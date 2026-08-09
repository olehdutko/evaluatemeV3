import { Test, TestingModule } from '@nestjs/testing';

export function createUnitTestModule(metadata: Parameters<typeof Test.createTestingModule>[0]): Promise<TestingModule> {
  return Test.createTestingModule(metadata).compile();
}
