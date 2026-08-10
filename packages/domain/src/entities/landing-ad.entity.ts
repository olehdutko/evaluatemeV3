import { Entity } from './base.entity';

export const LandingAdPosition = {
  HOME_TOP: 'home_top',
  HOME_BOTTOM: 'home_bottom',
  SIDEBAR: 'sidebar',
} as const;
export type LandingAdPosition = (typeof LandingAdPosition)[keyof typeof LandingAdPosition];

export interface LandingAd extends Entity {
  title: string;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  position: LandingAdPosition;
  isActive: boolean;
}
