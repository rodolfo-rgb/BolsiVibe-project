import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Transaction } from "../../types/transaction";

interface ExpensesByCategoryChartProps {
    transactions: Transaction[];
    title?: string;
    showCard?: boolean;
}

// Categorías predefinidas basadas en palabras clave en la descripción
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    "Alimentación": ["comida", "restaurante", "supermercado", "super", "mercado", "uber eats", "rappi", "didi food", "alimentos", "lunch", "desayuno", "cena", "cafe", "café"],
    "Transporte": ["uber", "didi", "taxi", "gasolina", "gas", "estacionamiento", "metro", "transporte", "camión", "autobus"],
    "Entretenimiento": ["netflix", "spotify", "cine", "juegos", "videojuegos", "streaming", "disney", "hbo", "amazon prime", "entretenimiento"],
    "Servicios": ["luz", "agua", "gas natural", "internet", "teléfono", "telefono", "celular", "electricidad", "cfe", "telmex"],
    "Salud": ["farmacia", "doctor", "médico", "medico", "hospital", "medicinas", "consultorio", "dentista", "salud"],
    "Educación": ["escuela", "universidad", "curso", "libro", "udemy", "coursera", "educación", "colegiatura", "inscripción"],
    "Ropa": ["ropa", "zapatos", "tienda", "zara", "h&m", "liverpool", "palacio", "vestido", "pantalón"],
    "Hogar": ["alquiler", "renta", "hipoteca", "muebles", "decoración", "mantenimiento", "casa"],
    "Suscripciones": ["suscripción", "membresía", "mensualidad", "anualidad", "premium"],
};

const CATEGORY_COLORS: Record<string, string> = {
    "Alimentación": "#FF6384",
    "Transporte": "#36A2EB",
    "Entretenimiento": "#FFCE56",
    "Servicios": "#4BC0C0",
    "Salud": "#9966FF",
    "Educación": "#FF9F40",
    "Ropa": "#C9CBCF",
    "Hogar": "#7BC225",
    "Suscripciones": "#FF6B6B",
    "Otros": "#8B8B8B",
};

const categorizeExpense = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => lowerDesc.includes(keyword))) {
            return category;
        }
    }
    
    return "Otros";
};

const ExpensesByCategoryChart = ({ 
    transactions, 
    title = "Gastos por Categoría",
    showCard = true 
}: ExpensesByCategoryChartProps) => {
    const chartData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === "expense");
        
        const categoryTotals: Record<string, number> = {};
        
        expenses.forEach(expense => {
            const category = categorizeExpense(expense.description || "Otros");
            // Usar valor absoluto porque los gastos pueden venir como negativos
            const amount = Math.abs(expense.amount);
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });
        
        return Object.entries(categoryTotals)
            .map(([name, value]) => ({
                name,
                value,
                color: CATEGORY_COLORS[name] || CATEGORY_COLORS["Otros"],
            }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                        ${data.value.toLocaleString("es-ES")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {percentage}% del total
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ percent }: any) => {
        if (percent < 0.05) return null; // No mostrar etiquetas para menos del 5%
        return `${(percent * 100).toFixed(0)}%`;
    };

    if (chartData.length === 0) {
        const content = (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay gastos para mostrar
            </div>
        );

        if (!showCard) return content;

        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {content}
                </CardContent>
            </Card>
        );
    }

    const chartContent = (
        <div className="space-y-4">
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            
            {/* Lista detallada */}
            <div className="space-y-2">
                {chartData.map((item, index) => {
                    const percentage = ((item.value / totalExpenses) * 100).toFixed(1);
                    return (
                        <div 
                            key={index} 
                            className="flex items-center justify-between text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: item.color }}
                                />
                                <span>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-muted-foreground">{percentage}%</span>
                                <span className="font-medium">
                                    ${item.value.toLocaleString("es-ES")}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div className="flex items-center justify-between pt-2 border-t font-semibold">
                    <span>Total</span>
                    <span>${totalExpenses.toLocaleString("es-ES")}</span>
                </div>
            </div>
        </div>
    );

    if (!showCard) return chartContent;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {chartContent}
            </CardContent>
        </Card>
    );
};

export default ExpensesByCategoryChart;
