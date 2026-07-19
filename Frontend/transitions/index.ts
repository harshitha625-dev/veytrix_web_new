export * from './types';
export * from './transitionsPack';

import { transitionsPack } from './transitionsPack';
import { extraTransitionsPack } from './extraTransitionsPack';
import { TransitionModule } from './types';

const allTransitionsList = [...transitionsPack, ...extraTransitionsPack];

const transitionRegistry = new Map<string, TransitionModule>();
allTransitionsList.forEach(t => transitionRegistry.set(t.id, t));

/**
 * Retrieves a transition module by its unique identifier.
 * @param id Unique identifier of the transition
 */
export const getTransition = (id: string): TransitionModule | null => {
  return transitionRegistry.get(id) || null;
};

/**
 * Retrieves all transition modules belonging to a specific category.
 * @param category The transition category
 */
export const getTransitionsByCategory = (category: string): TransitionModule[] => {
  return allTransitionsList.filter(t => t.category === category);
};

/**
 * Retrieves all registered transitions.
 */
export const getAllTransitions = (): TransitionModule[] => {
  return allTransitionsList;
};
