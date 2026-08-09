import { LandingAd } from '../entities/landing-ad.entity';

export interface ILandingAdRepository {
  findActiveByPosition(position: 'home_top' | 'home_bottom' | 'sidebar'): Promise<LandingAd[]>;
}
