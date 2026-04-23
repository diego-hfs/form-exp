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

const PERFIL_ATIVO_KEY = 'perfil_ativo';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  perfil: Perfil | null;
  perfis: Perfil[];
  perfilLoading: boolean;
  nome: string;
  authorizeTab: () => Promise<void>;
  resetTabAuthorization: () => void;
  signOut: () => Promise<void>;
  setPerfilAtivo: (p: Perfil) => void;
  clearPerfilAtivo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  perfil: null,
  perfis: [],
  perfilLoading: true,
  nome: '',
  authorizeTab: async () => {},
  resetTabAuthorization: () => {},
  signOut: async () => {},
  setPerfilAtivo: () => {},
  clearPerfilAtivo: () => {},
});


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilAtivo, setPerfilAtivoState] = useState<Perfil | null>(null);
  const [perfilLoading, setPerfilLoading] = useState(true);
  const tabInstanceIdRef = useRef(createTabId());
  const tabAuthorizedRef = useRef(false);

  const clearLocalState = () => {
    setUser(null);
    setSession(null);
    setPerfis([]);
    setPerfilAtivoState(null);
    setLoading(false);
    setPerfilLoading(false);
    sessionStorage.removeItem('perfil');
    sessionStorage.removeItem('nome');
    sessionStorage.removeItem(PERFIL_ATIVO_KEY);
  };

  const setPerfilAtivo = (p: Perfil) => {
    sessionStorage.setItem(PERFIL_ATIVO_KEY, p);
    sessionStorage.setItem('perfil', p);
    setPerfilAtivoState(p);
  };

  const clearPerfilAtivo = () => {
    sessionStorage.removeItem(PERFIL_ATIVO_KEY);
    sessionStorage.removeItem('perfil');
    setPerfilAtivoState(null);
  };

  const fetchRoles = async (userId: string) => {
    setPerfilLoading(true);
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const lista = (data?.map(r => r.role) ?? []) as Perfil[];
    setPerfis(lista);

    // Se tem apenas 1 perfil, ativa automaticamente.
    // Se tem mais de 1, restaura o salvo (se ainda válido) ou deixa null para o seletor escolher.
    if (lista.length === 1) {
      setPerfilAtivo(lista[0]);
    } else if (lista.length > 1) {
      const salvo = sessionStorage.getItem(PERFIL_ATIVO_KEY) as Perfil | null;
      if (salvo && lista.includes(salvo)) {
        setPerfilAtivoState(salvo);
      } else {
        setPerfilAtivoState(null);
      }
    } else {
      setPerfilAtivoState(null);
    }
    setPerfilLoading(false);
  };

  const applySessionState = async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setLoading(false);

    if (nextSession?.user) {
      await fetchRoles(nextSession.user.id);
      return;
    }

    setPerfis([]);
    setPerfilAtivoState(null);
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

    const denyTabAccess = (clearSupabaseSession = true) => {
      resetTabAuthorization();
      clearLocalState();
      if (!clearSupabaseSession) return;
      // Limpa o JWT do localStorage de forma assíncrona, sem bloquear o fluxo.
      // Não usamos await aqui para evitar travar o callback síncrono do
      // onAuthStateChange (recomendado pela documentação do Supabase).
      void supabase.auth.signOut({ scope: 'local' }).catch(() => {});
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
        // Já estamos saindo — apenas limpa o estado local sem chamar
        // signOut novamente (evita loop de eventos SIGNED_OUT).
        denyTabAccess(false);
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
    // Limpa o estado local primeiro para que componentes parem imediatamente
    // de fazer polling/requisições e a UI fique responsiva.
    resetTabAuthorization();
    clearLocalState();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore — o estado já foi limpo localmente
    }
  };

  const nome = user?.user_metadata?.nome?.split(' ')[0] || '';

  return (
    <AuthContext.Provider value={{ user, session, loading, perfil, perfilLoading, nome, authorizeTab, resetTabAuthorization, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
