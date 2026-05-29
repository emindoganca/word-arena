import { CampaignUnit } from '../game/campaign/types';
import { VsQuestion } from '../game/vs/types';

/** Uygulama yalnızca bu paketi okur — ham Tatoeba/CEFR dosyaları bundle'a girmez */
import pack from './generated/content-pack.json';

export interface ContentPackMeta {
  generatedAt: string;
  license: {
    sentences: string;
    levels: string;
  };
  counts: {
    vs: number;
    placement: number;
    campaignUnits: number;
  };
  sources: string[];
  note?: string;
}

export interface ContentPack {
  meta: ContentPackMeta;
  vs: VsQuestion[];
  placement: VsQuestion[];
  campaign: CampaignUnit[];
}

const content = pack as ContentPack;

export const CONTENT_META = content.meta;
export const VS_QUESTION_POOL: VsQuestion[] = content.vs;
export const PLACEMENT_QUESTIONS: VsQuestion[] = content.placement;
export const CAMPAIGN_UNITS: CampaignUnit[] = content.campaign;

export function pickVsMatchQuestions(count: number): VsQuestion[] {
  const shuffled = [...VS_QUESTION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
