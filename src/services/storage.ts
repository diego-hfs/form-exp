import { Conferencia } from '@/types/conferencia';

const STORAGE_KEY = 'conferencias';

export function getConferencias(): Conferencia[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveConferencia(conf: Conferencia): void {
  const all = getConferencias();
  const idx = all.findIndex(c => c.id === conf.id);
  if (idx >= 0) {
    all[idx] = conf;
  } else {
    all.push(conf);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getConferenciaPorEmbarque(numero: string): Conferencia | undefined {
  return getConferencias().find(c => c.numeroEmbarque === numero);
}
