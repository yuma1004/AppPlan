import { AppItem } from '../types/app';

export const mockApps: AppItem[] = [
  {
    id: 'app-1',
    name: 'SEKKEIYA',
    description: 'A comprehensive architecture design platform',
    updatedAt: new Date('2026-03-25T10:00:00Z').toISOString(),
  },
  {
    id: 'app-2',
    name: 'DDB',
    description: 'Document Database for drawings search and management',
    updatedAt: new Date('2026-03-27T14:30:00Z').toISOString(),
  },
  {
    id: 'app-3',
    name: 'THE SCORE',
    description: 'Image scoring and evaluation system',
    updatedAt: new Date('2026-03-26T09:00:00Z').toISOString(),
  },
];
