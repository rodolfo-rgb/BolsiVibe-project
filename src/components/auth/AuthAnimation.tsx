import { DollarSign } from "lucide-react";

const AuthAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
            <div className="relative">
                <DollarSign className="w-20 h-20 text-primary animate-bounce" />
                <div className="absolute -inset-1 bg-primary/20 rounded-full blur animate-pulse" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-center">
                Bienvenido a tu gestor financiero personal
            </h1>
            <p className="mt-2 text-center text-muted-foreground">
                Administra tus finanzas de manera inteligente
            </p>
        </div>
    );
};

export default AuthAnimation;