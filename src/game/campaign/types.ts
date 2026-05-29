export type CampaignStepType =
  | 'intro'
  | 'vocabulary'
  | 'listen'
  | 'fill_blank'
  | 'translate';

export interface CampaignStep {
  id: string;
  type: CampaignStepType;
  promptEn: string;
  promptTr?: string;
  correctAnswer?: string;
  options?: string[];
}

export interface CampaignLesson {
  id: string;
  title: string;
  description: string;
  steps: CampaignStep[];
  xpReward: number;
}

export interface CampaignUnit {
  id: string;
  title: string;
  lessons: CampaignLesson[];
}

export interface CampaignProgress {
  completedLessonIds: string[];
  currentLessonId: string | null;
  currentStepIndex: number;
}
