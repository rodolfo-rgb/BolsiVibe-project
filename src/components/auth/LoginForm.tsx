import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Mail } from "lucide-react";
import { supabase } from "../../integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast({
                title: "¡Bienvenido!",
                description: "Has iniciado sesión exitosamente.",
            });
        } catch (error) {
            const authError = error as AuthError;
            let errorMessage = "Error al iniciar sesión";

            if (authError.message.includes("Invalid login credentials")) {
                errorMessage = "Correo electrónico o contraseña incorrectos";
            } else if (authError.message.includes("Email not confirmed")) {
                errorMessage = "Por favor verifica tu correo electrónico antes de iniciar sesión";
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo iniciar sesión con Google",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">O continúa con</span>
                </div>
            </div>
            <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
            >
                <Mail className="mr-2 h-4 w-4" /> Google
            </Button>
        </div>
    );
};

export default LoginForm;