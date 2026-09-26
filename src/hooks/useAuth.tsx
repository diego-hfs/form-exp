import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Perfil } from '@/types/conferencia';

const USER_KEY = 'expedicheck_demo_user';
const PERFIL_KEY = 'expedicheck_perfil_ativo';
const DEMO_PERFIS: Perfil[] = ['separador', 'conferente', 'lider', 'fiscal'];

export interface DemoUser {
  id: string;
  user_metadata: { nome: string };
}

interface AuthContextType {
  user: DemoUser | null;
  session: { demo: true } | null;
  loading: boolean;
  perfil: Perfil | null;
  perfis: Perfil[];
  perfilLoading: boolean;
  nome: string;
  loginDemo: (nome: string) => Promise<void>;
  authorizeTab: () => Promise<void>;
  resetTabAuthorization: () => void;
  signOut: () => Promise<void>;
  setPerfilAtivo: (p: Perfil) => void;
  clearPerfilAtivo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, perfil: null, perfis: [], perfilLoading: false, nome: '',
  loginDemo: async () => {}, authorizeTab: async () => {}, resetTabAuthorization: () => {}, signOut: async () => {},
  setPerfilAtivo: () => {}, clearPerfilAtivo: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem(USER_KEY);
    const savedPerfil = sessionStorage.getItem(PERFIL_KEY) as Perfil | null;
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { sessionStorage.removeItem(USER_KEY); }
    }
    if (savedPerfil && DEMO_PERFIS.includes(savedPerfil)) setPerfil(savedPerfil);
    setLoading(false);
  }, []);

  const loginDemo = async (nomeCompleto: string) => {
    const nomeFinal = nomeCompleto.trim() || 'Usuário Demo';
    const next: DemoUser = { id: 'demo-user', user_metadata: { nome: nomeFinal } };
    sessionStorage.setItem(USER_KEY, JSON.stringify(next));
    setUser(next);
  };

  const setPerfilAtivo = (p: Perfil) => {
    sessionStorage.setItem(PERFIL_KEY, p);
    sessionStorage.setItem('perfil', p);
    setPerfil(p);
  };

  const clearPerfilAtivo = () => {
    sessionStorage.removeItem(PERFIL_KEY);
    sessionStorage.removeItem('perfil');
    setPerfil(null);
  };

  const signOut = async () => {
    sessionStorage.removeItem(USER_KEY);
    clearPerfilAtivo();
    setUser(null);
  };

  const nome = user?.user_metadata.nome?.split(' ')[0] || '';

  return (
    <AuthContext.Provider value={{
      user, session: user ? { demo: true } : null, loading, perfil, perfis: user ? DEMO_PERFIS : [],
      perfilLoading: false, nome, loginDemo, authorizeTab: async () => {}, resetTabAuthorization: () => {},
      signOut, setPerfilAtivo, clearPerfilAtivo,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
