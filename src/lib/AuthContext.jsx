import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'usr_clinician_01',
    email: 'clinician@afiyasauti.ke',
    full_name: 'Dr. Amina Ochieng',
    role: 'clinician',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'afiya-sauti',
    public_settings: { auth_required: false },
  });

  useEffect(() => {
    checkAppState();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || 'Dr. Amina Ochieng',
            role: session.user.user_metadata?.role || 'clinician',
          });
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      const settings = await base44.app.getPublicSettings();
      setAppPublicSettings(settings);
      await checkUserAuth();
    } catch {
      // Safe fallback
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || 'Dr. Amina Ochieng',
          role: session.user.user_metadata?.role || 'clinician',
        });
        setIsAuthenticated(true);
      } else {
        // Fallback default active session for demo / production exploration
        setUser({
          id: 'usr_clinician_01',
          email: 'clinician@afiyasauti.ke',
          full_name: 'Dr. Amina Ochieng',
          role: 'clinician',
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('[Supabase Auth Check]', error);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase SignOut]', err);
    }
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
