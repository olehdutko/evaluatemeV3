import { AccessCode } from '../entities/access-code.entity';

export interface IAccessCodeRepository {
  findById(id: string): Promise<AccessCode | null>;
  findByCode(code: string): Promise<AccessCode | null>;
  save(accessCode: AccessCode): Promise<AccessCode>;
}
