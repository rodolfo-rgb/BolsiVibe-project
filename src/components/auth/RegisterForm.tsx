import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

const RegisterForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            // Split name into first_name and last_name
            const [firstName, ...lastNameParts] = name.trim().split(" ");
            const lastName = lastNameParts.join(" ");

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName || null,
                    },
                    emailRedirectTo: window.location.origin,
                },
            });

            if (error) throw error;

            // Sign out immediately after registration to force login
            await supabase.auth.signOut();

            toast({
                title: "Registro exitoso",
                description: "Por favor inicia sesión con tus credenciales.",
            });

            // Reset form
            setName("");
            setEmail("");
            setPassword("");

        } catch (error) {
            const authError = error as AuthError;
            let errorMessage = "Ocurrió un error durante el registro";

            if (authError.message.includes("Email rate limit exceeded")) {
                errorMessage = "Demasiados intentos. Por favor espera unos minutos.";
            } else if (authError.message.includes("User already registered")) {
                errorMessage = "Este correo electrónico ya está registrado";
            } else if (authError.message.includes("Weak password")) {
                errorMessage = "La contraseña es muy débil. Usa al menos 6 caracteres.";
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

    return (
        <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-900">Registro</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Input
                        type="text"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>
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
                    {isLoading ? "Registrando..." : "Registrarse"}
                </Button>
            </form>
        </div>
    );
};

export default RegisterForm;