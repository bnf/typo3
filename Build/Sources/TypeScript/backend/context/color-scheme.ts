import { createContext } from '@lit/context';
import './context-root';

export type ColorScheme = 'auto' | 'light' | 'dark';
export const colorSchemeContext = createContext<ColorScheme>('typo3-backend-color-scheme');
