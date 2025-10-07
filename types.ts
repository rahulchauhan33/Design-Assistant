import type { ComponentType } from 'react';

export enum Personality {
  UX_COACH = 'UX_COACH',
  PRODUCT_PM = 'PRODUCT_PM',
  ENGINEER = 'ENGINEER',
  IMAGE_GEN = 'IMAGE_GEN',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string; // base64 data URL for display
}

export interface PersonalityData {
  id: Personality;
  name: string;
  description: string;
  systemInstruction: string;
  // Fix: Use ComponentType from react to resolve namespace error.
  icon: ComponentType<{ className?: string }>;
  suggestions: string[];
}

export interface SavedChat {
  id: string;
  timestamp: number;
  messages: ChatMessage[];
  personality: Personality;
}

// Fix: Add and export the TourStep interface to resolve an import error in OnboardingTour.tsx.
export interface TourStep {
  targetId: string;
  title: string;
  content: string;
}