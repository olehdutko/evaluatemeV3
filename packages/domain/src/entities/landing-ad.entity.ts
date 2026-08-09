import { Entity } from './base.entity';

export interface LandingAd extends Entity {
  title: string;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  position: 'home_top' | 'home_bottom' | 'sidebar';
  isActive: boolean;
}
