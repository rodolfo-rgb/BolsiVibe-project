import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../lib/auth";
import { supabase } from "../integrations/supabase/client";
import { KeyRound, CheckCircle, AlertCircle } from "lucide-react";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
    const { toast } = useToast();
    const { clearPasswordRecovery } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar si hay hash de recuperación en la URL o una sesión válida
        const checkRecoverySession = async () => {
            // Verificar hash en la URL (formato de Supabase)
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const type = hashParams.get('type');
            
            if (type === 'recovery') {
                setIsValidSession(true);
                return;
            }

            // También verificar si hay una sesión activa (usuario llegó desde el enlace)
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Verificar si el usuario llegó por recuperación de contraseña
                // comprobando si hay un access_token en el hash
                const accessToken = hashParams.get('access_token');
                if (accessToken || window.location.pathname === '/reset-password') {
                    setIsValidSession(true);
                    return;
                }
            }
            
            setIsValidSession(!!session);
        };
        
        checkRecoverySession();

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, _session) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsValidSession(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Error",
                description: "La contraseña debe tener al menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Las contraseñas no coinciden.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            setIsSuccess(true);
            toast({
                title: "¡Contraseña actualizada!",
                description: "Tu contraseña ha sido cambiada exitosamente.",
            });

            // Limpiar el estado de recuperación
            clearPasswordRecovery();

            // Cerrar sesión después de cambiar la contraseña
            await supabase.auth.signOut();

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate("/");
            }, 3000);

        } catch (error) {
            console.error("Error updating password:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la contraseña. El enlace puede haber expirado.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isValidSession === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando enlace...</p>
                </div>
            </div>
        );
    }

    // Invalid or expired link
    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="bg-red-100 p-4 rounded-full">
                                <AlertCircle className="h-12 w-12 text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Enlace Inválido</h2>
                        <p className="text-gray-600">
                            El enlace de recuperación ha expirado o no es válido.
                        </p>
                        <Button onClick={() => navigate("/")} className="w-full">
                            Volver al inicio de sesión
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">¡Contraseña Actualizada!</h2>
                        <p className="text-gray-600">
                            Tu contraseña ha sido cambiada exitosamente.
                        </p>
                        <p className="text-sm text-gray-500">
                            Serás redirigido al inicio de sesión...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Password reset form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <KeyRound className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Nueva Contraseña</h2>
                    <p className="text-gray-600 text-sm">
                        Ingresa tu nueva contraseña
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva contraseña</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
