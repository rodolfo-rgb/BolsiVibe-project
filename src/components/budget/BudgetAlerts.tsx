import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
    AlertTriangle,
    Bell,
    CalendarClock,
    CircleAlert,
    TrendingUp,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";

interface CategorySpending {
    category: string;
    planned: number;
    actual: number;
    difference: number;
    percentageUsed: number;
}

interface BudgetAlertsProps {
    alerts: BudgetAlert[];
    categorySpending: CategorySpending[];
    loading: boolean;
    onRefresh: () => void;
    pendingExpensesCount: number;
    overdueExpensesCount: number;
    overspentCategoriesCount: number;
}

const BudgetAlerts = ({
    alerts,
    categorySpending,
    loading,
    onRefresh,
    pendingExpensesCount,
    overdueExpensesCount,
    overspentCategoriesCount,
}: BudgetAlertsProps) => {
    const [isAlertsOpen, setIsAlertsOpen] = useState(true);
    const [isSpendingOpen, setIsSpendingOpen] = useState(false);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'error':
                return 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400';
            case 'warning':
                return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400';
            case 'info':
                return 'bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400';
            default:
                return 'bg-muted border-border';
        }
    };

    const getSeverityIcon = (severity: string, type: string) => {
        if (type === 'overdue') return <XCircle className="h-5 w-5 text-red-500" />;
        if (type === 'due_soon') return <CalendarClock className="h-5 w-5 text-yellow-500" />;
        if (type === 'overspent') return <TrendingUp className="h-5 w-5 text-red-500" />;
        if (type === 'pending_reminder') return <Bell className="h-5 w-5 text-blue-500" />;
        
        switch (severity) {
            case 'error':
                return <CircleAlert className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Bell className="h-5 w-5 text-blue-500" />;
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    if (loading) {
        return (
            <Card className="p-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="h-16 bg-muted rounded"></div>
                </div>
            </Card>
        );
    }

    const hasAlerts = alerts.length > 0;
    const errorCount = alerts.filter(a => a.severity === 'error').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;

    return (
        <div className="space-y-4">
            {/* Resumen rápido */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center">
                    <p className="text-2xl font-bold">{pendingExpensesCount}</p>
                    <p className="text-xs text-muted-foreground">Pendientes</p>
                </Card>
                <Card className={`p-3 text-center ${overdueExpensesCount > 0 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                    <p className={`text-2xl font-bold ${overdueExpensesCount > 0 ? 'text-red-500' : ''}`}>
                        {overdueExpensesCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Vencidos</p>
                </Card>
                <Card className={`p-3 text-center ${overspentCategoriesCount > 0 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                    <p className={`text-2xl font-bold ${overspentCategoriesCount > 0 ? 'text-red-500' : ''}`}>
                        {overspentCategoriesCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Excedidos</p>
                </Card>
            </div>

            {/* Alertas */}
            <Collapsible open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
                <Card className="p-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <h3 className="font-semibold">Alertas</h3>
                            {hasAlerts && (
                                <div className="flex gap-1">
                                    {errorCount > 0 && (
                                        <Badge variant="destructive" className="text-xs">
                                            {errorCount}
                                        </Badge>
                                    )}
                                    {warningCount > 0 && (
                                        <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700">
                                            {warningCount}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRefresh();
                                }}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            {isAlertsOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4">
                        {!hasAlerts ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p>¡Todo en orden! No hay alertas pendientes.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {getSeverityIcon(alert.severity, alert.type)}
                                            <div className="flex-1">
                                                <p className="font-medium">{alert.title}</p>
                                                <p className="text-sm opacity-80">{alert.message}</p>
                                                {alert.dueDate && (
                                                    <p className="text-xs mt-1 opacity-60">
                                                        Vence: {format(parseISO(alert.dueDate), "PPP", { locale: es })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Comparativa de gastos */}
            {categorySpending.length > 0 && (
                <Collapsible open={isSpendingOpen} onOpenChange={setIsSpendingOpen}>
                    <Card className="p-4">
                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                <h3 className="font-semibold">Gasto Real vs Planificado</h3>
                            </div>
                            {isSpendingOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-4">
                            <div className="space-y-4">
                                {categorySpending.map((cat) => (
                                    <div key={cat.category} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{cat.category}</span>
                                            <span className={cat.percentageUsed > 100 ? 'text-red-500 font-semibold' : ''}>
                                                ${cat.actual.toLocaleString('es-ES')} / ${cat.planned.toLocaleString('es-ES')}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <Progress 
                                                value={Math.min(cat.percentageUsed, 100)} 
                                                className="h-2"
                                            />
                                            <div 
                                                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(cat.percentageUsed)}`}
                                                style={{ width: `${Math.min(cat.percentageUsed, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{cat.percentageUsed.toFixed(0)}% usado</span>
                                            {cat.difference > 0 ? (
                                                <span className="text-green-600">
                                                    Disponible: ${cat.difference.toLocaleString('es-ES')}
                                                </span>
                                            ) : cat.difference < 0 ? (
                                                <span className="text-red-500">
                                                    Excedido: ${Math.abs(cat.difference).toLocaleString('es-ES')}
                                                </span>
                                            ) : (
                                                <span>Presupuesto agotado</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            )}
        </div>
    );
};

export default BudgetAlerts;
