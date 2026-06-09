import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Ceremony } from '../domain/types';
import { loadCeremonies, saveCeremonies } from '../storage/ceremoniesStorage';

type CeremoniesContextValue = {
  ceremonies: Ceremony[];
  loading: boolean;
  addCeremony: (c: Ceremony) => void;
  updateCeremony: (c: Ceremony) => void;
  removeCeremony: (id: string) => void;
  getCeremony: (id: string) => Ceremony | undefined;
};

const CeremoniesContext = createContext<CeremoniesContextValue | null>(null);

export function CeremoniesProvider({ children }: { children: React.ReactNode }) {
  const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCeremonies().then(list => {
      setCeremonies(list);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((updater: Ceremony[] | ((prev: Ceremony[]) => Ceremony[])) => {
    setCeremonies(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCeremonies(next);
      return next;
    });
  }, []);

  const addCeremony = useCallback((c: Ceremony) => persist(prev => [c, ...prev]), [persist]);
  const updateCeremony = useCallback((c: Ceremony) => persist(prev => prev.map(x => x.id === c.id ? c : x)), [persist]);
  const removeCeremony = useCallback((id: string) => persist(prev => prev.filter(x => x.id !== id)), [persist]);
  const getCeremony = useCallback((id: string) => ceremonies.find(c => c.id === id), [ceremonies]);

  return (
    <CeremoniesContext.Provider value={{ ceremonies, loading, addCeremony, updateCeremony, removeCeremony, getCeremony }}>
      {children}
    </CeremoniesContext.Provider>
  );
}

export function useCeremonies(): CeremoniesContextValue {
  const ctx = useContext(CeremoniesContext);
  if (!ctx) throw new Error('useCeremonies must be used within CeremoniesProvider');
  return ctx;
}
