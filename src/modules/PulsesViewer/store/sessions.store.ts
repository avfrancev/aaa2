import { v4 as uuidv4 } from 'uuid'

export const useSessionsStore = createGlobalState(() => {
  // export function useSessionsStore() {
  const sessions = useLocalStorage('sessions', new Set<string>())

  const currentSession = useLocalStorage('currentSession', '')

  if (!sessions.value.size) {
    currentSession.value = addSession()
  }

  function addSession(s: string = uuidv4()): string {
    sessions.value.add(s)
    return s
  }

  function removeSession(s: string) {
    sessions.value.delete(s)
  }

  return {
    sessions,
    addSession,
    removeSession,
    currentSession,
  }
})
