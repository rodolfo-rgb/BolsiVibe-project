import { useState } from "react";
import { Button } from "../ui/button";
import { Plus, Target } from "lucide-react";
import { useSavingsGoals } from "../../hooks/useSavingsGoals";
import { useToast } from "../../hooks/use-toast";
import GoalCard from "./GoalCard";
import NewGoalForm from "./NewGoalForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const GoalsList = () => {
    const { goals, loading, addGoal, deleteGoal, contributeToGoal, getActiveGoals, getCompletedGoals } = useSavingsGoals();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const activeGoals = getActiveGoals();
    const completedGoals = getCompletedGoals();

    const handleContribute = async (goalId: string, amount: number, accountId?: string) => {
        try {
            await contributeToGoal(goalId, amount, accountId);
            toast({
                title: "Abono registrado",
                description: `Se abonaron $${amount.toLocaleString("es-ES")} a tu meta.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo registrar el abono.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (goalId: string) => {
        try {
            await deleteGoal(goalId);
            toast({
                title: "Meta eliminada",
                description: "La meta ha sido eliminada correctamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la meta.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Cargando metas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Metas de Ahorro</h2>
                    <p className="text-sm text-muted-foreground">
                        {activeGoals.length} activas · {completedGoals.length} completadas
                    </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Meta
                </Button>
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-16 border rounded-xl bg-muted/30">
                    <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">Sin metas de ahorro</h3>
                    <p className="text-muted-foreground mb-4">
                        Crea tu primera meta para empezar a ahorrar con propósito
                    </p>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear mi primera meta
                    </Button>
                </div>
            ) : (
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="active">
                            Activas ({activeGoals.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completadas ({completedGoals.length})
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="active">
                        {activeGoals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No tienes metas activas
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {activeGoals.map((goal) => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        onContribute={handleContribute}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="completed">
                        {completedGoals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aún no has completado ninguna meta
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {completedGoals.map((goal) => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        onContribute={handleContribute}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {/* Form */}
            <NewGoalForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={addGoal}
            />
        </div>
    );
};

export default GoalsList;
