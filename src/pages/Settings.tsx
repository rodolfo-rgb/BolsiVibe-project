import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { useToast } from "../components/ui/use-toast";
import { FileDown, FileText } from "lucide-react";

const Settings = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [name, setName] = useState("Usuario Demo");
    const email = "usuario@demo.com";

    const handleNameChange = (newName: string) => {
        setName(newName);
        toast({
            title: "Nombre actualizado",
            description: "Tu nombre ha sido actualizado exitosamente.",
        });
    };

    const handlePasswordChange = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        toast({
            title: "Contraseña actualizada",
            description: "Tu contraseña ha sido actualizada exitosamente.",
        });
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
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="account">Cuenta</TabsTrigger>
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
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" value={email} disabled />
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
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                                <Button type="submit">Actualizar Contraseña</Button>
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