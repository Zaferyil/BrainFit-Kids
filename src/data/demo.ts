import type { Hat } from '../components/Avatar'
import { kidPhoto } from './kinderBilder'
import type { IconName } from '../components/Icon'

// Beispieldaten, bis Supabase angebunden ist.

export type PictureId = 'stern' | 'herz' | 'blitz' | 'krone' | 'diamant' | 'geschenk' | 'pfote' | 'feuer' | 'buch'

export const PICTURES: { id: PictureId; label: string; icon: IconName; color: string; fill: string }[] = [
  { id: 'stern', label: 'Stern', icon: 'star', color: '#DE9800', fill: '#FFC531' },
  { id: 'herz', label: 'Herz', icon: 'heart', color: '#C2264E', fill: '#FF5C8A' },
  { id: 'blitz', label: 'Blitz', icon: 'bolt', color: '#5B47D6', fill: '#C9C0FF' },
  { id: 'krone', label: 'Krone', icon: 'crown', color: '#DE9800', fill: '#FFE58F' },
  { id: 'diamant', label: 'Diamant', icon: 'gem', color: '#1F7FD1', fill: '#9BD3FF' },
  { id: 'geschenk', label: 'Geschenk', icon: 'gift', color: '#25913F', fill: '#B6EFC2' },
  { id: 'pfote', label: 'Pfote', icon: 'paw', color: '#8A4B20', fill: '#E8B48A' },
  { id: 'feuer', label: 'Feuer', icon: 'flame', color: '#E06A00', fill: '#FFB15E' },
  { id: 'buch', label: 'Buch', icon: 'book', color: '#5B47D6', fill: '#E4DFFF' },
]

export type Kid = {
  id: string
  name: string
  birthYear: number
  password: PictureId[]
  avatar: { hat: Hat; hatColor: string; shirt: string; hair: string; skin: string; glasses?: boolean; photo?: string }
}

export type SchoolClass = { code: string; kids: Kid[] }

export const CLASSES: SchoolClass[] = [
  {
    code: 'LINZ-7K',
    kids: [
      { id: 'lena', name: 'Lena', birthYear: 2018, password: ['stern', 'herz', 'blitz', 'krone'], avatar: { photo: kidPhoto('lena'), hat: 'cap', hatColor: '#FF4D6D', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#F6C9A6' } },
      { id: 'jonas', name: 'Jonas', birthYear: 2017, password: ['pfote', 'pfote', 'stern', 'buch'], avatar: { photo: kidPhoto('jonas'), hat: 'phones', hatColor: '#3DBE5B', shirt: '#FF8A1F', hair: '#E9B949', skin: '#F6C9A6' } },
      { id: 'elif', name: 'Elif', birthYear: 2019, password: ['herz', 'geschenk', 'herz', 'diamant'], avatar: { photo: kidPhoto('elif'), hat: 'band', hatColor: '#A06BFF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' } },
      { id: 'noah', name: 'Noah', birthYear: 2016, password: ['feuer', 'blitz', 'feuer', 'blitz'], avatar: { photo: kidPhoto('noah'), hat: 'none', hatColor: '#FF4D6D', shirt: '#A06BFF', hair: '#231A4F', skin: '#7A4A2E' } },
      { id: 'mia', name: 'Mia', birthYear: 2020, password: ['krone', 'krone', 'herz', 'stern'], avatar: { photo: kidPhoto('mia'), hat: 'crown', hatColor: '#FFC531', shirt: '#FF4D6D', hair: '#C2410C', skin: '#F6C9A6' } },
      { id: 'ben', name: 'Ben', birthYear: 2015, password: ['buch', 'diamant', 'stern', 'pfote'], avatar: { photo: kidPhoto('ben'), hat: 'none', hatColor: '#FF4D6D', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#B9774E', glasses: true } },
      { id: 'emma', name: 'Emma', birthYear: 2017, password: ['geschenk', 'stern', 'geschenk', 'stern'], avatar: { photo: kidPhoto('emma'), hat: 'wizard', hatColor: '#5B47D6', shirt: '#FFC531', hair: '#E9B949', skin: '#F6C9A6' } },
      { id: 'can', name: 'Can', birthYear: 2018, password: ['blitz', 'diamant', 'feuer', 'krone'], avatar: { photo: kidPhoto('can'), hat: 'cap', hatColor: '#3BA7FF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' } },
    ],
  },
]

export function normalizeCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function findClass(code: string) {
  return CLASSES.find((c) => normalizeCode(c.code) === normalizeCode(code))
}

export function findKid(classCode: string, kidId: string) {
  return findClass(classCode)?.kids.find((k) => k.id === kidId)
}
