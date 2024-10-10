import { v4 as uuidv4 } from 'uuid'


interface ISession {
  id: string
}

export function useSessionsStore() {
  const sessions = useLocalStorage("sessions", new Set<ISession>())

  const currentSession = useLocalStorage('currentSession', <ISession>{})

  if (!sessions.value.size) {
    currentSession.value = addSession()
  }

  function addSession(id: string = uuidv4()): ISession {
    const s = { id }
    sessions.value.add(s)
    return s
  }

  function removeSession(session: ISession) {
    sessions.value.delete(session)
  }

  return {
    sessions,
    addSession,
    removeSession,
    currentSession
  }
}