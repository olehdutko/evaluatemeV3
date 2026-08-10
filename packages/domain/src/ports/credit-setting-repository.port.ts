import { CreditSetting } from '../entities/credit-setting.entity';

export const ICreditSettingRepository = Symbol('ICreditSettingRepository');

export interface ICreditSettingRepository {
  findByKey(key: string): Promise<CreditSetting | null>;
  save(setting: CreditSetting): Promise<CreditSetting>;
}
