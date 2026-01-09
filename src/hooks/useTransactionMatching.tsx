import { useState, useEffect, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../lib/auth";
import { Transaction } from "../types/transaction";
import { startOfMonth, endOfMonth } from "date-fns";

interface UnlinkedExpense {
    id: string;
    category: string;
    amount: number;
    due_date?: string | null;
    plan_id: string | null;
}

interface TransactionMatch {
    transaction: Transaction;
    expense: UnlinkedExpense;
    matchScore: number; // 0-100, mayor = mejor coincidencia
    matchReason: string;
}

interface UseTransactionMatchingReturn {
    pendingMatches: TransactionMatch[];
    loading: boolean;
    linkTransactionToExpense: (transactionId: string, expenseId: string) => Promise<boolean>;
    dismissMatch: (transactionId: string) => void;
    refreshMatches: () => Promise<void>;
}

// Mapeo de palabras clave a categorías del presupuesto
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Alquiler': ['alquiler', 'renta', 'arriendo', 'departamento', 'casa', 'vivienda'],
    'Transporte': ['uber', 'didi', 'taxi', 'gasolina', 'gas', 'estacionamiento', 'metro', 'autobus', 'peaje', 'transporte'],
    'Alimentación': ['super', 'supermercado', 'walmart', 'soriana', 'chedraui', 'oxxo', 'comida', 'restaurante', 'food', 'uber eats', 'rappi', 'didi food', 'mercado'],
    'Servicios (Luz, Agua, etc.)': ['cfe', 'luz', 'agua', 'gas natural', 'internet', 'telmex', 'totalplay', 'izzi', 'megacable', 'telefono', 'celular'],
    'Entretenimiento': ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'cine', 'cinepolis', 'cinemex', 'juegos', 'steam', 'playstation', 'xbox'],
    'Salud': ['farmacia', 'doctor', 'medico', 'hospital', 'clinica', 'laboratorio', 'dentista', 'consulta', 'medicina', 'benavides', 'guadalajara'],
    'Educación': ['escuela', 'universidad', 'colegio', 'curso', 'udemy', 'platzi', 'libro', 'educacion', 'colegiatura', 'inscripcion'],
};

export const useTransactionMatching = (): UseTransactionMatchingReturn => {
    const { user } = useAuth();
    const [pendingMatches, setPendingMatches] = useState<TransactionMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissedTransactions, setDismissedTransactions] = useState<Set<string>>(new Set());

    // Detectar categoría basándose en la descripción
    const detectCategory = (description: string): { category: string; score: number } | null => {
        const lowerDesc = description.toLowerCase();
        
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            for (const keyword of keywords) {
                if (lowerDesc.includes(keyword)) {
                    // Mayor score si la palabra clave es más específica (más larga)
                    const score = Math.min(70 + keyword.length * 3, 95);
                    return { category, score };
                }
            }
        }
        
        return null;
    };

    // Calcular score de coincidencia por monto
    const calculateAmountScore = (transactionAmount: number, expenseAmount: number): number => {
        const diff = Math.abs(transactionAmount - expenseAmount);
        const percentDiff = (diff / expenseAmount) * 100;
        
        if (percentDiff === 0) return 100; // Coincidencia exacta
        if (percentDiff <= 5) return 90;   // Muy cercano
        if (percentDiff <= 10) return 75;  // Cercano
        if (percentDiff <= 20) return 50;  // Moderado
        if (percentDiff <= 50) return 25;  // Bajo
        return 0;
    };

    // Buscar coincidencias entre transacciones y gastos pendientes
    const findMatches = useCallback(async () => {
        if (!user) return [];

        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Obtener transacciones recientes sin vincular a un gasto del presupuesto
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'expense')
            .gte('date', monthStart.toISOString())
            .lte('date', monthEnd.toISOString())
            .order('date', { ascending: false });

        if (txError) {
            console.error('Error fetching transactions:', txError);
            return [];
        }

        // Obtener gastos pendientes del plan actual
        const { data: expenses, error: expError } = await supabase
            .from('budget_expenses')
            .select(`
                id,
                category,
                amount,
                due_date,
                plan_id,
                is_paid,
                transaction_id,
                budget_plans!inner(user_id, date)
            `)
            .eq('is_paid', false)
            .eq('budget_plans.user_id', user.id)
            .gte('budget_plans.date', monthStart.toISOString())
            .lte('budget_plans.date', monthEnd.toISOString());

        if (expError) {
            console.error('Error fetching expenses:', expError);
            return [];
        }

        const unlinkedExpenses: UnlinkedExpense[] = (expenses || [])
            .filter(exp => !exp.transaction_id)
            .map(exp => ({
                id: exp.id,
                category: exp.category,
                amount: exp.amount,
                due_date: exp.due_date,
                plan_id: exp.plan_id,
            }));

        // Obtener IDs de transacciones ya vinculadas
        const linkedTransactionIds = new Set(
            (expenses || [])
                .filter(exp => exp.transaction_id)
                .map(exp => exp.transaction_id)
        );

        const matches: TransactionMatch[] = [];

        for (const tx of transactions || []) {
            // Saltar transacciones ya vinculadas o descartadas
            if (linkedTransactionIds.has(tx.id) || dismissedTransactions.has(tx.id)) {
                continue;
            }

            const description = tx.description || '';
            const categoryMatch = detectCategory(description);

            if (!categoryMatch) continue;

            // Buscar gasto pendiente de la misma categoría
            const matchingExpense = unlinkedExpenses.find(
                exp => exp.category === categoryMatch.category
            );

            if (matchingExpense) {
                const amountScore = calculateAmountScore(Math.abs(tx.amount), matchingExpense.amount);
                const avgScore = Math.round((categoryMatch.score + amountScore) / 2);
                
                // Solo sugerir si el score es mayor a 40
                if (avgScore >= 40) {
                    let matchReason = `Categoría: ${categoryMatch.category}`;
                    if (amountScore >= 90) {
                        matchReason += ' • Monto coincide';
                    } else if (amountScore >= 50) {
                        matchReason += ' • Monto similar';
                    }

                    matches.push({
                        transaction: tx as Transaction,
                        expense: matchingExpense,
                        matchScore: avgScore,
                        matchReason,
                    });
                }
            }
        }

        // Ordenar por score descendente
        matches.sort((a, b) => b.matchScore - a.matchScore);

        return matches;
    }, [user, dismissedTransactions]);

    // Vincular transacción a gasto
    const linkTransactionToExpense = async (transactionId: string, expenseId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('budget_expenses')
                .update({
                    is_paid: true,
                    transaction_id: transactionId,
                })
                .eq('id', expenseId);

            if (error) throw error;

            // Remover de la lista de coincidencias pendientes
            setPendingMatches(prev => prev.filter(m => m.transaction.id !== transactionId));
            
            return true;
        } catch (error) {
            console.error('Error linking transaction:', error);
            return false;
        }
    };

    // Descartar una sugerencia
    const dismissMatch = (transactionId: string) => {
        setDismissedTransactions(prev => new Set([...prev, transactionId]));
        setPendingMatches(prev => prev.filter(m => m.transaction.id !== transactionId));
    };

    // Refrescar coincidencias
    const refreshMatches = async () => {
        setLoading(true);
        try {
            const matches = await findMatches();
            setPendingMatches(matches);
        } finally {
            setLoading(false);
        }
    };

    // Cargar coincidencias al inicio
    useEffect(() => {
        if (user) {
            refreshMatches();
        }
    }, [user]);

    return {
        pendingMatches,
        loading,
        linkTransactionToExpense,
        dismissMatch,
        refreshMatches,
    };
};
