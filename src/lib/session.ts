import { load, save } from './storage'

export type Session = { classCode: string; kidId: string }

const CLASS_KEY = 'bfk.classCode'
const SESSION_KEY = 'bfk.session'

export const getSavedClass = () => load<string | null>(CLASS_KEY, null)
export const saveClass = (code: string | null) => save(CLASS_KEY, code)
export const getSession = () => load<Session | null>(SESSION_KEY, null)
export const saveSession = (s: Session | null) => save(SESSION_KEY, s)
