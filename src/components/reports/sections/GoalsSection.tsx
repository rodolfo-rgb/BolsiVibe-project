import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { SavingsGoal } from '../../../types/savings-goal';
import { differenceInDays } from 'date-fns';

interface GoalsSectionProps {
    goals: SavingsGoal[];
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({ goals }) => {
    const activeGoals = goals.filter(g => !g.is_completed);
    const completedGoals = goals.filter(g => g.is_completed);
    
    const totalTarget = activeGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalSaved = activeGoals.reduce((sum, g) => sum + g.current_amount, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const getDaysRemaining = (deadline: string | null) => {
        if (!deadline) return null;
        const days = differenceInDays(new Date(deadline), new Date());
        return days;
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    if (goals.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-5 w-5 text-primary" />
                        Metas de Ahorro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm text-center py-4">
                        No tienes metas de ahorro configuradas. Crea una para empezar a ahorrar.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-5 w-5 text-primary" />
                    Metas de Ahorro
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Resumen General */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{activeGoals.length}</p>
                        <p className="text-xs text-muted-foreground">Metas Activas</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{completedGoals.length}</p>
                        <p className="text-xs text-muted-foreground">Completadas</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{overallProgress.toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">Progreso Total</p>
                    </div>
                </div>

                {/* Progreso Total */}
                {activeGoals.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total ahorrado</span>
                            <span className="font-medium">
                                {formatCurrency(totalSaved)} de {formatCurrency(totalTarget)}
                            </span>
                        </div>
                        <Progress value={overallProgress} className="h-3" />
                    </div>
                )}

                {/* Lista de Metas Activas */}
                {activeGoals.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Metas en Progreso
                        </h4>
                        <div className="space-y-3">
                            {activeGoals.slice(0, 5).map((goal) => {
                                const progress = (goal.current_amount / goal.target_amount) * 100;
                                const daysRemaining = getDaysRemaining(goal.deadline);

                                return (
                                    <div key={goal.id} className="p-3 border rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{goal.icon}</span>
                                                <span className="font-medium text-sm">{goal.name}</span>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {progress.toFixed(0)}%
                                            </span>
                                        </div>
                                        
                                        <Progress 
                                            value={progress} 
                                            className={`h-2 ${getProgressColor(progress)}`}
                                        />
                                        
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>
                                                {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                                            </span>
                                            {daysRemaining !== null && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {daysRemaining > 0 
                                                        ? `${daysRemaining} días restantes`
                                                        : daysRemaining === 0 
                                                            ? 'Vence hoy'
                                                            : `Vencida hace ${Math.abs(daysRemaining)} días`
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Metas Completadas */}
                {completedGoals.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Metas Completadas
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {completedGoals.slice(0, 4).map((goal) => (
                                <div 
                                    key={goal.id} 
                                    className="p-2 border rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center gap-2"
                                >
                                    <span>{goal.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{goal.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(goal.target_amount)}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
