import { LucideIcon } from 'lucide-react';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  icon: LucideIcon;
  color: string; // Tailwind color class specific to text/bg, e.g., "blue-500"
  category: CategoryId;
}

export type CategoryId = 'main' | 'dev' | 'media' | 'tools' | 'social';

export interface Category {
  id: CategoryId;
  label: string;
}

export interface SearchEngine {
  name: string;
  url: string;
  queryParam: string;
  placeholder: string;
}