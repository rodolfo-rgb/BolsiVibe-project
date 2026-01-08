import { useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { useCreditCards } from "../../hooks/useCreditCards";
import { CreditCard, BankType } from "../../types/creditCard";
import { useAuth } from "../../lib/auth";

export const useCardState = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { creditCards, addCreditCard, editCreditCard, deleteCreditCard } = useCreditCards();
    const [isNewCardFormOpen, setIsNewCardFormOpen] = useState(false);
    const [isCardsDialogOpen, setIsCardsDialogOpen] = useState(false);
    const [cardToEdit, setCardToEdit] = useState<CreditCard | null>(null);
    const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
    const [showAmounts, setShowAmounts] = useState(true);

    const handleAddCard = async (data: {
        name: string;
        limit_amount: number;
        payment_day: number;
        cutoff_day: number;
        bank: BankType;
        bank_name?: string;
        expiration_date?: string;
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
            await addCreditCard(data);
            setIsNewCardFormOpen(false);
            toast({
                title: "Tarjeta agregada",
                description: `La tarjeta ${data.name} ha sido agregada exitosamente.`,
            });
        } catch (error: any) {
            if (error?.message?.includes('unique constraint')) {
                throw error;
            }
            toast({
                title: "Error",
                description: "No se pudo agregar la tarjeta",
                variant: "destructive",
            });
            throw error;
        }
    };

    const handleEditCard = async (data: {
        name: string;
        limit_amount: number;
        payment_day: number;
        cutoff_day: number;
        bank: BankType;
        bank_name?: string;
        expiration_date?: string;
    }) => {
        if (!user || !cardToEdit) {
            toast({
                title: "Error",
                description: "No se puede editar la tarjeta en este momento",
                variant: "destructive",
            });
            return;
        }

        try {
            await editCreditCard(cardToEdit.id, data);
            toast({
                title: "Tarjeta actualizada",
                description: `La tarjeta ${data.name} ha sido actualizada exitosamente.`,
            });
            setCardToEdit(null);
            setIsNewCardFormOpen(false);
        } catch (error: any) {
            if (error?.message?.includes('unique constraint')) {
                throw error;
            }
            toast({
                title: "Error",
                description: "No se pudo actualizar la tarjeta",
                variant: "destructive",
            });
            throw error;
        }
    };

    const handleDeleteCard = async () => {
        if (!user || !cardToDelete) {
            toast({
                title: "Error",
                description: "No se puede eliminar la tarjeta en este momento",
                variant: "destructive",
            });
            return;
        }

        const cardId = cardToDelete.id;
        const cardName = cardToDelete.name;

        try {
            await deleteCreditCard(cardId);
            toast({
                title: "Tarjeta eliminada",
                description: `La tarjeta ${cardName} ha sido eliminada exitosamente.`,
            });
            setCardToDelete(null);
        } catch (error: any) {
            console.error("Error deleting card:", error);
            toast({
                title: "Error al eliminar",
                description: error?.message || "No se pudo eliminar la tarjeta. Verifica que no tenga transacciones asociadas.",
                variant: "destructive",
            });
            throw error;
        }
    };

    return {
        creditCards,
        isNewCardFormOpen,
        setIsNewCardFormOpen,
        isCardsDialogOpen,
        setIsCardsDialogOpen,
        cardToEdit,
        setCardToEdit,
        cardToDelete,
        setCardToDelete,
        showAmounts,
        setShowAmounts,
        handleAddCard,
        handleEditCard,
        handleDeleteCard,
    };
};