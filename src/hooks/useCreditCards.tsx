import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../hooks/use-toast";
import { CreditCard } from "../types/creditCard";
import { useAuth } from "../lib/auth";

export const useCreditCards = () => {
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCreditCards();
        } else {
            setCreditCards([]);
            setLoading(false);
        }
    }, [user]);

    const fetchCreditCards = async () => {
        try {
            const { data, error } = await supabase
                .from("credit_cards")
                .select("*")
                .eq('user_id', user!.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCreditCards(data || []);
        } catch (error) {
            console.error("Error fetching credit cards:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las tarjetas de crédito",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const addCreditCard = async (data: {
        name: string;
        limit_amount: number;
        payment_day: number;
        cutoff_day: number;
    }) => {
        if (!user) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para realizar esta acción",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data: newCard, error } = await supabase
                .from("credit_cards")
                .insert([{
                    ...data,
                    current_balance: 0,
                    user_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;

            setCreditCards((prev) => [newCard, ...prev]);
            return newCard;
        } catch (error) {
            console.error("Error adding credit card:", error);
            throw error;
        }
    };

    const editCreditCard = async (cardId: string, data: {
        name: string;
        limit_amount: number;
        payment_day: number;
        cutoff_day: number;
    }) => {
        if (!user) {
            throw new Error("Usuario no autenticado");
        }

        try {
            const { data: updatedCard, error } = await supabase
                .from("credit_cards")
                .update({
                    ...data,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", cardId)
                .eq("user_id", user!.id)
                .select()
                .single();

            if (error) throw error;

            setCreditCards((prev) =>
                prev.map((card) => (card.id === cardId ? updatedCard : card))
            );

            return updatedCard;
        } catch (error) {
            console.error("Error updating credit card:", error);
            throw error;
        }
    };

    const deleteCreditCard = async (cardId: string) => {
        if (!user) {
            throw new Error("Usuario no autenticado");
        }

        try {
            const { error } = await supabase
                .from("credit_cards")
                .delete()
                .eq("id", cardId)
                .eq("user_id", user.id);

            if (error) throw error;

            setCreditCards((prev) => prev.filter((card) => card.id !== cardId));
        } catch (error) {
            console.error("Error deleting credit card:", error);
            throw error;
        }
    };

    return {
        creditCards,
        loading,
        setCreditCards,
        addCreditCard,
        editCreditCard,
        deleteCreditCard,
    };
};