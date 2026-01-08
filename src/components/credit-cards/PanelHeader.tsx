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
        <div className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5" />
                <span className="truncate">Tarjetas</span>
            </CardTitle>
            <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onToggleAmounts}>
                    {showAmounts ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </Button>
                <Button size="sm" onClick={onAddCard}>
                    Nueva
                </Button>
            </div>
        </div>
    );
};

export default PanelHeader;