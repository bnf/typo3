import { ContextRoot, ContextEvent, type Context } from '@lit/context';

/**
 * Module: @typo3/backend/context/context-root
 *
 * Shared module that acts as a central synchronization point
 * for all context consumers and providers (and must
 * therefore be imported by all modules that use `createContext()`)
 * in order to ensure that all context requests are replayed
 * if a context consumer is rendered prior to a context provider,
 * or if a context consumer is rendered inside the list frame
 * and desires context from the outer frame.
 */

if (window === top || window.name === 'typo3-backend') {
  new ContextRoot().attach(document.documentElement);
} else if (window.frameElement) {
  document.documentElement.addEventListener(
    'context-request',
    (event: ContextEvent<Context<unknown, unknown>>) => {
      window.frameElement.dispatchEvent(new ContextEvent(
        event.context,
        event.contextTarget,
        event.callback,
        event.subscribe,
      ));
    }
  );
}
