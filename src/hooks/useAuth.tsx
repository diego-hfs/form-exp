import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Perfil } from '@/types/conferencia';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  perfil: Perfil | null;
  perfilLoading: boolean;
  nome: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  perfil: null,
  perfilLoading: true,
  nome: '',
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [perfilLoading, setPerfilLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    setPerfilLoading(true);
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    setPerfil((data?.role as Perfil) ?? null);
    setPerfilLoading(false);
  };

  useEffect(() => {
    const isNewTab = !sessionStorage.getItem('tab_initialized');

    const init = async () => {
      if (isNewTab) {
        sessionStorage.setItem('tab_initialized', '1');
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setPerfil(null);
        setLoading(false);
        setPerfilLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setPerfilLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setPerfil(null);
        setPerfilLoading(false);
      }
    });

    init();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setPerfil(null);
    setUser(null);
    setSession(null);
    sessionStorage.removeItem('perfil');
    sessionStorage.removeItem('nome');
  };

  const nome = user?.user_metadata?.nome?.split(' ')[0] || '';

  return (
    <AuthContext.Provider value={{ user, session, loading, perfil, perfilLoading, nome, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
