import { SavingsGoal, GOAL_ICONS } from "../../types/savings-goal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Target, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

interface GoalsWidgetProps {
    goals: SavingsGoal[];
    maxItems?: number;
}

const GoalsWidget = ({ goals, maxItems = 3 }: GoalsWidgetProps) => {
    const navigate = useNavigate();
    const activeGoals = goals.filter((g) => !g.is_completed).slice(0, maxItems);
    
    const totalProgress = goals.length > 0
        ? (goals.reduce((sum, g) => sum + g.current_amount, 0) / 
           goals.reduce((sum, g) => sum + g.target_amount, 0)) * 100
        : 0;

    if (goals.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Metas de Ahorro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <Target className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mb-3">
                            Aún no tienes metas
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/budget")}
                        >
                            Crear meta
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Metas de Ahorro
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => navigate("/budget")}
                    >
                        Ver todas
                        <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overall progress */}
                <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progreso general</span>
                        <span className="font-semibold">{totalProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={totalProgress} className="h-2" />
                </div>

                {/* Goal list */}
                <div className="space-y-3">
                    {activeGoals.map((goal) => {
                        const icon = GOAL_ICONS.find((i) => i.id === goal.icon);
                        const progress = (goal.current_amount / goal.target_amount) * 100;
                        
                        return (
                            <div key={goal.id} className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                                    style={{ backgroundColor: `${goal.color}20` }}
                                >
                                    {icon?.emoji || "🎯"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium truncate">{goal.name}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {progress.toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress 
                                        value={progress} 
                                        className="h-1.5"
                                        style={{
                                            // @ts-ignore
                                            "--progress-background": goal.color,
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ${goal.current_amount.toLocaleString("es-ES")} / ${goal.target_amount.toLocaleString("es-ES")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Show more indicator */}
                {goals.filter(g => !g.is_completed).length > maxItems && (
                    <p className="text-xs text-center text-muted-foreground">
                        +{goals.filter(g => !g.is_completed).length - maxItems} metas más
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default GoalsWidget;
