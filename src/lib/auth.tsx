import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../components/ui/use-toast";

type AuthContextType = {
    session: Session | null;
    user: User | null;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Error getting session:", error.message);
                return;
            }
            setSession(session);
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (_event === 'TOKEN_REFRESHED') {
                console.log('Token refreshed successfully');
            }

            if (_event === 'SIGNED_OUT') {
                // Clear session and user state
                setSession(null);
                setUser(null);
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
            await supabase.auth.signOut();
            toast({
                title: "Sesión cerrada",
                description: "Has cerrado sesión exitosamente",
            });
        } catch (error) {
            console.error("Error signing out:", error);
            toast({
                title: "Error",
                description: "No se pudo cerrar la sesión",
                variant: "destructive",
            });
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, signOut }}>
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