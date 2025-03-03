import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ExternalLink, PlayCircle, BookOpen, Users, PiggyBank, Wallet, CreditCard, TrendingUp } from "lucide-react";
import TutorialDialog from "../components/education/TutorialDialog";

const tutorials = {
    "Presupuesto personal": {
        icon: <PiggyBank className="h-5 w-5" />,
        content: (
            <div className="space-y-4">
                <p>Un presupuesto personal es una herramienta fundamental para manejar tus finanzas. Aquí te enseñamos cómo crearlo:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Identifica tus ingresos mensuales totales</li>
                    <li>Lista todos tus gastos fijos (renta, servicios, etc.)</li>
                    <li>Categoriza tus gastos variables (comida, entretenimiento)</li>
                    <li>Establece metas de ahorro</li>
                    <li>Monitorea y ajusta tu presupuesto regularmente</li>
                </ol>
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <p className="font-semibold">Consejo Pro:</p>
                    <p>Usa la regla 50/30/20: 50% para necesidades, 30% para deseos, y 20% para ahorro.</p>
                </div>
            </div>
        )
    },
    "Ahorro e inversión": {
        icon: <Wallet className="h-5 w-5" />,
        content: (
            <div className="space-y-4">
                <p>El ahorro y la inversión son clave para tu futuro financiero:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Establece un fondo de emergencia</li>
                    <li>Identifica tus metas financieras</li>
                    <li>Conoce los diferentes tipos de inversiones</li>
                    <li>Diversifica tu portafolio</li>
                </ul>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                    <p className="font-semibold">Importante:</p>
                    <p>Comienza con inversiones de bajo riesgo mientras aprendes más sobre el mercado.</p>
                </div>
            </div>
        )
    },
    "Control de gastos": {
        icon: <TrendingUp className="h-5 w-5" />,
        content: (
            <div className="space-y-4">
                <p>Mantener un control efectivo de tus gastos es esencial:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Registra todos tus gastos diariamente</li>
                    <li>Categoriza tus gastos</li>
                    <li>Identifica patrones de gasto</li>
                    <li>Encuentra áreas de mejora</li>
                </ul>
                <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                    <p className="font-semibold">Recomendación:</p>
                    <p>Usa nuestra app para registrar automáticamente tus gastos y mantener un mejor control.</p>
                </div>
            </div>
        )
    },
    "Deudas y créditos": {
        icon: <CreditCard className="h-5 w-5" />,
        content: (
            <div className="space-y-4">
                <p>Maneja tus deudas y créditos de manera responsable:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Entiende los diferentes tipos de crédito</li>
                    <li>Conoce tu puntaje crediticio</li>
                    <li>Estrategias para pagar deudas</li>
                    <li>Uso responsable de tarjetas de crédito</li>
                </ul>
                <div className="bg-red-50 p-4 rounded-lg mt-4">
                    <p className="font-semibold">¡Cuidado!</p>
                    <p>Evita acumular deudas innecesarias y siempre lee los términos y condiciones.</p>
                </div>
            </div>
        )
    }
};

const Education = () => {
    const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Educación Financiera</h1>

            <Tabs defaultValue="tutorial" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
                    <TabsTrigger value="forums">Foros</TabsTrigger>
                    <TabsTrigger value="simulation">Simulación</TabsTrigger>
                </TabsList>

                <TabsContent value="tutorial">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Tutorial Financiero
                            </CardTitle>
                            <CardDescription>
                                Aprende los conceptos básicos de finanzas personales
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                {Object.entries(tutorials).map(([title, { icon }]) => (
                                    <Card key={title}>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {icon} {title}
                                            </CardTitle>
                                            <Button
                                                variant="outline"
                                                className="mt-2"
                                                onClick={() => setSelectedTutorial(title)}
                                            >
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Comenzar lección
                                            </Button>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="forums">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Foros de Finanzas
                            </CardTitle>
                            <CardDescription>
                                Únete a la conversación y aprende de otros
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                {
                                    title: "Reddit Personal Finance",
                                    url: "https://www.reddit.com/r/personalfinance/",
                                    description: "Comunidad de Reddit sobre finanzas personales"
                                },
                                {
                                    title: "Rankia",
                                    url: "https://www.rankia.com/foros/",
                                    description: "Foro español sobre inversiones y finanzas"
                                },
                                {
                                    title: "Investing.com",
                                    url: "https://es.investing.com/forums/",
                                    description: "Foros de trading e inversión"
                                }
                            ].map((forum) => (
                                <Card key={forum.title}>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            {forum.title}
                                            <Button variant="outline" asChild>
                                                <a href={forum.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Visitar
                                                </a>
                                            </Button>
                                        </CardTitle>
                                        <CardDescription>{forum.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="simulation">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlayCircle className="h-5 w-5" />
                                Simulador Financiero
                            </CardTitle>
                            <CardDescription>
                                Practica la gestión de tus finanzas sin riesgo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center p-8">
                                <h3 className="text-lg font-medium mb-4">
                                    ¡Próximamente!
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Estamos trabajando en un simulador que te permitirá practicar
                                    la gestión de tus finanzas en un entorno seguro.
                                </p>
                                <Button disabled>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Iniciar Simulación
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {selectedTutorial && (
                <TutorialDialog
                    isOpen={!!selectedTutorial}
                    onClose={() => setSelectedTutorial(null)}
                    tutorial={{
                        title: selectedTutorial,
                        content: tutorials[selectedTutorial as keyof typeof tutorials].content
                    }}
                />
            )}
        </div>
    );
};

export default Education;