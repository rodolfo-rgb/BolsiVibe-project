import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "../../integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const { toast } = useToast();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!resetEmail) {
            toast({
                title: "Error",
                description: "Por favor ingresa tu correo electrónico",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setResetEmailSent(true);
            toast({
                title: "Correo enviado",
                description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
            });
        } catch (error) {
            const authError = error as AuthError;
            let errorMessage = "No se pudo enviar el correo de recuperación";

            if (authError.message.includes("rate limit")) {
                errorMessage = "Demasiados intentos. Por favor espera unos minutos.";
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

    // Pantalla de confirmación de correo enviado
    if (resetEmailSent) {
        return (
            <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Correo Enviado</h2>
                    <div className="flex justify-center">
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-gray-600">
                        Hemos enviado un enlace de recuperación a:
                    </p>
                    <p className="font-semibold text-gray-900">{resetEmail}</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                        <p className="text-sm text-amber-800">
                            <strong>Importante:</strong> Haz clic en el enlace del correo para crear una nueva contraseña.
                            Si no lo encuentras, revisa tu carpeta de spam.
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setResetEmailSent(false);
                            setShowForgotPassword(false);
                            setResetEmail("");
                        }}
                        className="w-full"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al inicio de sesión
                    </Button>
                </div>
            </div>
        );
    }

    // Formulario de olvidé mi contraseña
    if (showForgotPassword) {
        return (
            <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg animate-fade-in">
                <button 
                    onClick={() => setShowForgotPassword(false)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver
                </button>
                <h2 className="text-2xl font-bold text-center text-gray-900">Recuperar Contraseña</h2>
                <p className="text-center text-gray-600 text-sm">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                        <Input
                            type="email"
                            placeholder="Correo electrónico"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full"
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                    </Button>
                </form>
            </div>
        );
    }

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
                <div className="text-right">
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
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