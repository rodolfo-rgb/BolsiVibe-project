import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";

interface Account {
    id: number;
    name: string;
    balance: number;
}

interface DeleteAccountDialogProps {
    isOpen: boolean;
    account: Account | null;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteAccountDialog = ({
    isOpen,
    onClose,
    onConfirm,
}: DeleteAccountDialogProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. La cuenta será eliminada permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteAccountDialog;