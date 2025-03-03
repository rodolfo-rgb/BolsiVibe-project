import { CreditCard, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { CardTitle } from "../ui/card";

interface PanelHeaderProps {
    showAmounts: boolean;
    onToggleAmounts: () => void;
    onAddCard: () => void;
}

const PanelHeader = ({ showAmounts, onToggleAmounts, onAddCard }: PanelHeaderProps) => {
    return (
        <div className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Mis Tarjetas de Crédito
            </CardTitle>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={onToggleAmounts}>
                    {showAmounts ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </Button>
                <Button onClick={onAddCard}>
                    Nueva Tarjeta
                </Button>
            </div>
        </div>
    );
};

export default PanelHeader;