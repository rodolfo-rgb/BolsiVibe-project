import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../components/ui/use-toast";

const PASSWORD_RECOVERY_KEY = 'bolsivibe_password_recovery';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    signOut: () => Promise<void>;
    isPasswordRecovery: boolean;
    clearPasswordRecovery: () => void;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    signOut: async () => { },
    isPasswordRecovery: false,
    clearPasswordRecovery: () => { },
});

// Función para verificar si estamos en modo recuperación
const checkIsPasswordRecovery = (): boolean => {
    // Verificar localStorage
    if (localStorage.getItem(PASSWORD_RECOVERY_KEY) === 'true') {
        return true;
    }
    // Verificar hash en la URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
        localStorage.setItem(PASSWORD_RECOVERY_KEY, 'true');
        return true;
    }
    return false;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Inicializar con el valor de localStorage para evitar parpadeos
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => checkIsPasswordRecovery());
    const { toast } = useToast();

    // Función para limpiar el estado de recuperación
    const clearPasswordRecovery = () => {
        localStorage.removeItem(PASSWORD_RECOVERY_KEY);
        setIsPasswordRecovery(false);
    };

    useEffect(() => {
        // Verificar nuevamente si hay hash de recuperación en la URL
        if (checkIsPasswordRecovery()) {
            setIsPasswordRecovery(true);
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Error getting session:", error.message);
                return;
            }
            // No establecer sesión si es recuperación de contraseña
            if (!checkIsPasswordRecovery()) {
                setSession(session);
                setUser(session?.user ?? null);
            } else {
                // Solo establecer user para permitir actualizar contraseña
                setUser(session?.user ?? null);
            }
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            
            if (event === 'TOKEN_REFRESHED') {
                console.log('Token refreshed successfully');
                // No hacer nada si estamos en recuperación
                if (checkIsPasswordRecovery()) {
                    return;
                }
            }

            // Detectar evento de recuperación de contraseña
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Password recovery event detected');
                localStorage.setItem(PASSWORD_RECOVERY_KEY, 'true');
                setIsPasswordRecovery(true);
                setUser(session?.user ?? null);
                return;
            }

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                clearPasswordRecovery();
                return;
            }

            // Si estamos en modo recuperación, NO establecer sesión normal
            if (checkIsPasswordRecovery()) {
                console.log('In password recovery mode, not setting session');
                setUser(session?.user ?? null);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            // Clear password recovery state
            clearPasswordRecovery();
            
            // First, clear local state
            setSession(null);
            setUser(null);
            
            // Then sign out from Supabase
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error("Error signing out:", error);
                // Even if there's an error, clear localStorage to force logout
                localStorage.removeItem('sb-tipkczahbkmjoxpagcty-auth-token');
            }
            
            toast({
                title: "Sesión cerrada",
                description: "Has cerrado sesión exitosamente",
            });
        } catch (error) {
            console.error("Error signing out:", error);
            // Force clear session even on error
            setSession(null);
            setUser(null);
            localStorage.removeItem('sb-tipkczahbkmjoxpagcty-auth-token');
            
            toast({
                title: "Sesión cerrada",
                description: "Se cerró la sesión",
            });
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, signOut, isPasswordRecovery, clearPasswordRecovery }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};