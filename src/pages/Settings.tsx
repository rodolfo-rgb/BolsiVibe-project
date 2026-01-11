import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { useToast } from "../components/ui/use-toast";
import { FileDown, FileText, Moon, Sun, Monitor, HelpCircle } from "lucide-react";
import { useAuth } from "../lib/auth";
import { supabase } from "../integrations/supabase/client";
import { useTheme } from "../hooks/useTheme";
import { useTour } from "../hooks/useTour";

const Settings = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const { resetTour } = useTour();
    const [name, setName] = useState("");
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Load user's current name from metadata
    useEffect(() => {
        if (user?.user_metadata?.name) {
            setName(user.user_metadata.name);
        } else if (user?.email) {
            setName(user.email.split('@')[0]);
        }
    }, [user]);

    const email = user?.email || "usuario@demo.com";

    const handleNameUpdate = async () => {
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "El nombre no puede estar vacío.",
                variant: "destructive",
            });
            return;
        }

        setIsUpdatingName(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { name: name.trim() }
            });

            if (error) throw error;

            toast({
                title: "Nombre actualizado",
                description: "Tu nombre ha sido actualizado exitosamente.",
            });
        } catch (error) {
            console.error("Error updating name:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el nombre. Intenta de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Validations
        if (!newPassword || !confirmPassword) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos de contraseña.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Error",
                description: "La nueva contraseña debe tener al menos 6 caracteres.",
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

        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            // Clear form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast({
                title: "Contraseña actualizada",
                description: "Tu contraseña ha sido actualizada exitosamente.",
            });
        } catch (error) {
            console.error("Error updating password:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la contraseña. Intenta de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleGenerateReport = () => {
        navigate("/report");
    };

    const handleExportReport = () => {
        toast({
            title: "Reporte exportado",
            description: "Tu reporte ha sido exportado exitosamente.",
        });
    };

    const handleDeleteAccount = () => {
        toast({
            title: "Cuenta eliminada",
            description: "Tu cuenta ha sido eliminada permanentemente.",
            variant: "destructive",
        });
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Configuración</h1>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="account">Cuenta</TabsTrigger>
                    <TabsTrigger value="appearance">Apariencia</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                    <TabsTrigger value="privacy">Privacidad</TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Cuenta</CardTitle>
                            <CardDescription>
                                Administra tu información personal y datos de la cuenta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <Button 
                                        onClick={handleNameUpdate} 
                                        disabled={isUpdatingName}
                                    >
                                        {isUpdatingName ? "Guardando..." : "Guardar"}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" value={email} disabled />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apariencia</CardTitle>
                            <CardDescription>
                                Personaliza la apariencia de la aplicación.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Tema</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <Button
                                        variant={theme === "light" ? "default" : "outline"}
                                        className="flex flex-col items-center gap-2 h-auto py-4"
                                        onClick={() => setTheme("light")}
                                    >
                                        <Sun className="h-6 w-6" />
                                        <span>Claro</span>
                                    </Button>
                                    <Button
                                        variant={theme === "dark" ? "default" : "outline"}
                                        className="flex flex-col items-center gap-2 h-auto py-4"
                                        onClick={() => setTheme("dark")}
                                    >
                                        <Moon className="h-6 w-6" />
                                        <span>Oscuro</span>
                                    </Button>
                                    <Button
                                        variant={theme === "system" ? "default" : "outline"}
                                        className="flex flex-col items-center gap-2 h-auto py-4"
                                        onClick={() => setTheme("system")}
                                    >
                                        <Monitor className="h-6 w-6" />
                                        <span>Sistema</span>
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Selecciona el tema que prefieras. El tema "Sistema" se ajustará automáticamente según las preferencias de tu dispositivo.
                                </p>
                            </div>

                            <div className="space-y-4 pt-6 border-t">
                                <Label>Tour de la Aplicación</Label>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Ver guía interactiva</p>
                                        <p className="text-sm text-muted-foreground">
                                            Revisa nuevamente el tour de las funcionalidades de BolsiVibe.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => {
                                            resetTour();
                                            navigate('/');
                                            toast({
                                                title: "Tour iniciado",
                                                description: "La guía interactiva comenzará en unos segundos.",
                                            });
                                        }}
                                    >
                                        <HelpCircle className="h-4 w-4" />
                                        Iniciar Tour
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seguridad</CardTitle>
                            <CardDescription>
                                Gestiona tu contraseña y opciones de reporte.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Contraseña Actual</Label>
                                    <Input 
                                        id="current-password" 
                                        type="password" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                                    <Input 
                                        id="new-password" 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                                    <Input 
                                        id="confirm-password" 
                                        type="password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                                </Button>
                            </form>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Reportes</h3>
                                <div className="flex gap-4">
                                    <Button onClick={handleGenerateReport} className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Ver Reporte
                                    </Button>
                                    <Button onClick={handleExportReport} variant="outline" className="flex items-center gap-2">
                                        <FileDown className="h-4 w-4" />
                                        Exportar Reporte
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="privacy">
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacidad</CardTitle>
                            <CardDescription>
                                Gestiona las opciones de privacidad de tu cuenta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full">
                                Cerrar Sesión
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        Eliminar Cuenta
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta
                                            y removerá tus datos de nuestros servidores.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                                            Eliminar Cuenta
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;