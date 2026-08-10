import { LandingAd, LandingAdPosition } from '../entities/landing-ad.entity';

export const ILandingAdRepository = Symbol('ILandingAdRepository');

export interface ILandingAdRepository {
  findActiveByPosition(position: LandingAdPosition): Promise<LandingAd[]>;
  findById(id: string): Promise<LandingAd | null>;
  save(ad: LandingAd): Promise<LandingAd>;
}
