import { createContext } from '@lit/context';
import './context-root';

export type Theme = 'modern' | 'classic' | string;
export const themeContext = createContext<Theme>('typo3-backend-theme');
