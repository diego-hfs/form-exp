import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Perfil } from '@/types/conferencia';

const TAB_ID_KEY = 'auth_tab_id';
const TAB_AUTHORIZED_KEY = 'auth_tab_authorized';
const AUTH_CHANNEL_NAME = 'auth-tab-sync';

const createTabId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  perfil: Perfil | null;
  perfilLoading: boolean;
  nome: string;
  authorizeTab: () => Promise<void>;
  resetTabAuthorization: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  perfil: null,
  perfilLoading: true,
  nome: '',
  authorizeTab: async () => {},
  resetTabAuthorization: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [perfilLoading, setPerfilLoading] = useState(true);
  const tabInstanceIdRef = useRef(createTabId());
  const tabAuthorizedRef = useRef(false);

  const clearLocalState = () => {
    setUser(null);
    setSession(null);
    setPerfil(null);
    setLoading(false);
    setPerfilLoading(false);
    sessionStorage.removeItem('perfil');
    sessionStorage.removeItem('nome');
  };

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

  const applySessionState = async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setLoading(false);

    if (nextSession?.user) {
      await fetchRole(nextSession.user.id);
      return;
    }

    setPerfil(null);
    setPerfilLoading(false);
  };

  const authorizeTab = async () => {
    sessionStorage.setItem(TAB_AUTHORIZED_KEY, '1');
    tabAuthorizedRef.current = true;
    const { data: { session: activeSession } } = await supabase.auth.getSession();
    await applySessionState(activeSession);
  };

  const resetTabAuthorization = () => {
    sessionStorage.removeItem(TAB_AUTHORIZED_KEY);
    tabAuthorizedRef.current = false;
  };

  useEffect(() => {
    const tabId = sessionStorage.getItem(TAB_ID_KEY);
    const channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(AUTH_CHANNEL_NAME)
      : null;
    let isMounted = true;
    let duplicateTabDetected = false;

    const denyTabAccess = async () => {
      resetTabAuthorization();
      clearLocalState();
      // Limpa também o JWT do localStorage para evitar que requisições
      // continuem sendo enviadas com a sessão anterior (causa de erros
      // de RLS ao tentar inserir/atualizar registros após reload da aba).
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // ignore
      }
    };

    if (channel) {
      channel.onmessage = (event) => {
        const message = event.data;

        if (
          message?.type === 'presence-check' &&
          message.tabId === sessionStorage.getItem(TAB_ID_KEY) &&
          message.instanceId !== tabInstanceIdRef.current
        ) {
          channel.postMessage({
            type: 'presence-response',
            tabId: message.tabId,
            targetInstanceId: message.instanceId,
          });
        }

        if (
          message?.type === 'presence-response' &&
          message.tabId === sessionStorage.getItem(TAB_ID_KEY) &&
          message.targetInstanceId === tabInstanceIdRef.current
        ) {
          duplicateTabDetected = true;
          if (isMounted) denyTabAccess();
        }
      };
    }

    const init = async () => {
      if (!tabId) {
        sessionStorage.setItem(TAB_ID_KEY, createTabId());
        denyTabAccess();
        return;
      }

      channel?.postMessage({
        type: 'presence-check',
        tabId,
        instanceId: tabInstanceIdRef.current,
      });

      await new Promise(resolve => window.setTimeout(resolve, 120));

      if (!isMounted || duplicateTabDetected) return;

      const isAuthorizedTab = sessionStorage.getItem(TAB_AUTHORIZED_KEY) === '1';
      tabAuthorizedRef.current = isAuthorizedTab;

      if (!isAuthorizedTab) {
        clearLocalState();
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      await applySessionState(session);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        denyTabAccess();
        return;
      }

      if (!tabAuthorizedRef.current) {
        setLoading(false);
        setPerfilLoading(false);
        return;
      }

      void applySessionState(session);
    });

    init();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      channel?.close();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    resetTabAuthorization();
    clearLocalState();
  };

  const nome = user?.user_metadata?.nome?.split(' ')[0] || '';

  return (
    <AuthContext.Provider value={{ user, session, loading, perfil, perfilLoading, nome, authorizeTab, resetTabAuthorization, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
