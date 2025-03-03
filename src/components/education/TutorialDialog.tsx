import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react";

interface TutorialDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tutorial: {
        title: string;
        content: React.ReactNode;
    };
}

const TutorialDialog: React.FC<TutorialDialogProps> = ({
    isOpen,
    onClose,
    tutorial,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{tutorial.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {tutorial.content}
                    <div className="flex justify-end">
                        <Button onClick={onClose} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Completar lección
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TutorialDialog;