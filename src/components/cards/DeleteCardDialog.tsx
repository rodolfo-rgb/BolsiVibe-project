import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { CreditCard } from "../../types/creditCard";

interface DeleteCardDialogProps {
    isOpen: boolean;
    card: CreditCard | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

const DeleteCardDialog = ({
    isOpen,
    card,
    onClose,
    onConfirm,
}: DeleteCardDialogProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        try {
            setIsDeleting(true);
            await onConfirm();
        } catch (error) {
            console.error("Error deleting card:", error);
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && !isDeleting) {
            onClose();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará la tarjeta{" "}
                        {card?.name} permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Cancelar
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteCardDialog;