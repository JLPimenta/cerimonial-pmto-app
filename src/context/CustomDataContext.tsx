import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Authority, CeremonyType, EsferaKey } from '../domain/types';
import { CATALOGO } from '../domain/catalog';
import { TIPOS_SOLENIDADE } from '../domain/ceremonyTypes';
import { loadCustomAuthorities, saveCustomAuthorities, buildCustomAuthority } from '../storage/customAuthoritiesStorage';
import { loadCustomCeremonyTypes, saveCustomCeremonyTypes, buildCustomCeremonyType } from '../storage/customCeremonyTypesStorage';

type CustomDataContextValue = {
  customAuthorities: Authority[];
  allAuthorities: () => Authority[];
  authById: (id: string) => Authority | undefined;
  addAuthority: (cargo: string, esfera: EsferaKey) => Authority;
  removeAuthority: (id: string) => void;
  customCeremonyTypes: CeremonyType[];
  allCeremonyTypes: () => CeremonyType[];
  ceremonyTypeById: (id: string) => CeremonyType;
  addCeremonyType: (label: string, icon: string) => CeremonyType;
  removeCeremonyType: (id: string) => void;
};

const CustomDataContext = createContext<CustomDataContextValue | null>(null);

export function CustomDataProvider({ children }: { children: React.ReactNode }) {
  const [customAuthorities, setCustomAuthorities] = useState<Authority[]>([]);
  const [customCeremonyTypes, setCustomCeremonyTypes] = useState<CeremonyType[]>([]);

  useEffect(() => {
    loadCustomAuthorities().then(setCustomAuthorities);
    loadCustomCeremonyTypes().then(setCustomCeremonyTypes);
  }, []);

  const allAuthorities = useCallback(
    () => [...CATALOGO, ...customAuthorities],
    [customAuthorities],
  );

  const authById = useCallback(
    (id: string) => allAuthorities().find(a => a.id === id),
    [allAuthorities],
  );

  const addAuthority = useCallback((cargo: string, esfera: EsferaKey): Authority => {
    const novo = buildCustomAuthority(cargo, esfera);
    setCustomAuthorities(prev => {
      const next = [...prev, novo];
      saveCustomAuthorities(next);
      return next;
    });
    return novo;
  }, []);

  const removeAuthority = useCallback((id: string) => {
    setCustomAuthorities(prev => {
      const next = prev.filter(a => a.id !== id);
      saveCustomAuthorities(next);
      return next;
    });
  }, []);

  const allCeremonyTypes = useCallback(
    () => [...TIPOS_SOLENIDADE, ...customCeremonyTypes],
    [customCeremonyTypes],
  );

  const ceremonyTypeById = useCallback(
    (id: string) => allCeremonyTypes().find(t => t.id === id) ?? TIPOS_SOLENIDADE[0],
    [allCeremonyTypes],
  );

  const addCeremonyType = useCallback((label: string, icon: string): CeremonyType => {
    const novo = buildCustomCeremonyType(label, icon);
    setCustomCeremonyTypes(prev => {
      const next = [...prev, novo];
      saveCustomCeremonyTypes(next);
      return next;
    });
    return novo;
  }, []);

  const removeCeremonyType = useCallback((id: string) => {
    setCustomCeremonyTypes(prev => {
      const next = prev.filter(t => t.id !== id);
      saveCustomCeremonyTypes(next);
      return next;
    });
  }, []);

  return (
    <CustomDataContext.Provider value={{
      customAuthorities, allAuthorities, authById, addAuthority, removeAuthority,
      customCeremonyTypes, allCeremonyTypes, ceremonyTypeById, addCeremonyType, removeCeremonyType,
    }}>
      {children}
    </CustomDataContext.Provider>
  );
}

export function useCustomData(): CustomDataContextValue {
  const ctx = useContext(CustomDataContext);
  if (!ctx) throw new Error('useCustomData must be used within CustomDataProvider');
  return ctx;
}
