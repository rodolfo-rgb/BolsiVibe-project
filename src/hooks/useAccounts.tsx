import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../components/ui/use-toast";
import { Account } from "../types/accounts";
import { useAuth } from "../lib/auth";

export const useAccounts = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchAccounts();
        } else {
            setAccounts([]);
            setLoading(false);
        }
    }, [user]);

    const fetchAccounts = async () => {
        try {
            const { data, error } = await supabase
                .from("accounts")
                .select("*")
                .eq('user_id', user!.id)
                .order("name", { ascending: true });

            if (error) throw error;

            // Ensure "Cartera" appears first
            const sortedAccounts = (data || []).sort((a, b) => {
                if (a.name === "Cartera") return -1;
                if (b.name === "Cartera") return 1;
                return a.name.localeCompare(b.name);
            });

            setAccounts(sortedAccounts);
        } catch (error) {
            console.error("Error fetching accounts:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las cuentas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const addAccount = async (data: { name: string; balance: number }) => {
        if (!user) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para realizar esta acción",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data: newAccount, error } = await supabase
                .from("accounts")
                .insert([{ ...data, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            setAccounts((prev) => {
                const updatedAccounts = [newAccount, ...prev];
                // Re-sort to maintain "Cartera" first
                return updatedAccounts.sort((a, b) => {
                    if (a.name === "Cartera") return -1;
                    if (b.name === "Cartera") return 1;
                    return a.name.localeCompare(b.name);
                });
            });
            return newAccount;
        } catch (error) {
            console.error("Error adding account:", error);
            throw error;
        }
    };

    const editAccount = async (id: string, data: { name: string; balance: number }) => {
        if (!user) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para realizar esta acción",
                variant: "destructive",
            });
            return;
        }

        try {
            const { error } = await supabase
                .from("accounts")
                .update({
                    ...data,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            setAccounts((prev) =>
                prev.map((account) =>
                    account.id === id ? { ...account, ...data } : account
                )
            );
        } catch (error) {
            console.error("Error updating account:", error);
            throw error;
        }
    };

    const deleteAccount = async (id: string) => {
        if (!user) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para realizar esta acción",
                variant: "destructive",
            });
            return;
        }

        try {
            const { error } = await supabase
                .from("accounts")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            setAccounts((prev) => prev.filter((account) => account.id !== id));
        } catch (error) {
            console.error("Error deleting account:", error);
            throw error;
        }
    };

    const getTotalBalance = () => {
        return accounts.reduce((sum, account) => sum + (account.balance ?? 0), 0);
    };

    return {
        accounts,
        loading,
        addAccount,
        editAccount,
        deleteAccount,
        getTotalBalance,
    };
};