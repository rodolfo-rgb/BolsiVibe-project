import { Transaction } from "../../../types/transaction";
import ExpensesByCategoryChart from "../../charts/ExpensesByCategoryChart";

interface ExpensesCategorySectionProps {
    transactions: Transaction[];
}

const ExpensesCategorySection = ({ transactions }: ExpensesCategorySectionProps) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <ExpensesByCategoryChart 
                transactions={transactions} 
                title="Distribución de Gastos por Categoría"
                showCard={false}
            />
        </div>
    );
};

export default ExpensesCategorySection;
