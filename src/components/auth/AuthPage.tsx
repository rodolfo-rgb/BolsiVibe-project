import { useState, useEffect } from "react";
import AuthAnimation from "./AuthAnimation";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Button } from "../ui/button";

const AuthPage = () => {
    const [showAnimation, setShowAnimation] = useState(true);
    const [isLogin, setIsLogin] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAnimation(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (showAnimation) {
        return <AuthAnimation />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="flex justify-center space-x-4 mb-6">
                    <Button
                        variant={isLogin ? "default" : "outline"}
                        onClick={() => setIsLogin(true)}
                    >
                        Iniciar Sesión
                    </Button>
                    <Button
                        variant={!isLogin ? "default" : "outline"}
                        onClick={() => setIsLogin(false)}
                    >
                        Registrarse
                    </Button>
                </div>
                {isLogin ? <LoginForm /> : <RegisterForm />}
            </div>
        </div>
    );
};

export default AuthPage;