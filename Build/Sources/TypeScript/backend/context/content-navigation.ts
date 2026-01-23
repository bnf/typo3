import { createContext } from '@lit/context';
import './context-root';

export class ContentNavigationContext {
  constructor(
    public collapsed: boolean,
    public hidden: boolean,
    public shouldShowCollapseButton: boolean,
    public shouldShowExpandButton: boolean,
    public navigationLabelCollapse: string,
    public navigationLabelExpand: string,
    public focusTarget: string|null,
    public toggle: () => void,
  ) {}
}
export const contentNavigationContext = createContext<ContentNavigationContext>('typo3-content-navigation');
