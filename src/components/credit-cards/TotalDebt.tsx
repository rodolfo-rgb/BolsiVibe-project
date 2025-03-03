import { CreditCard } from "../../types/creditCard";

interface TotalDebtProps {
    cards: CreditCard[];
    showAmounts: boolean;
    onClick: () => void;
}

const TotalDebt = ({ cards, showAmounts, onClick }: TotalDebtProps) => {
    const totalDebt = cards.reduce((sum, card) => sum + (card.current_balance || 0), 0);

    return (
        <div
            className="flex items-center justify-between pt-4 mt-4 border-t cursor-pointer hover:opacity-80"
            onClick={onClick}
        >
            <span className="font-semibold">Deuda Total</span>
            <span className="text-xl font-bold text-destructive">
                {showAmounts ? `$${totalDebt.toLocaleString("es-ES")}` : "••••••"}
            </span>
        </div>
    );
};

export default TotalDebt;