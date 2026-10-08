import { create } from 'zustand'

/**
 * Active disaster event for the session.
 * Sidebar event-scoped links stay disabled while this is null (plan.md §G).
 */
export const useEventStore = create((set) => ({
  currentEventId: null,
  currentEventName: null,

  setCurrentEvent(id, name = null) {
    set({ currentEventId: id, currentEventName: name })
  },

  clearEvent() {
    set({ currentEventId: null, currentEventName: null })
  },
}))
