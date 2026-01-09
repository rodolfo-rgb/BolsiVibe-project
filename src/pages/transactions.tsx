import TransactionsPanel from "../components/TransactionPanel";
import RecurringTransactionsList from "../components/transactions/RecurringTransactionsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Receipt, CalendarClock } from "lucide-react";

const Transactions = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Transacciones</h1>
            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Historial
                    </TabsTrigger>
                    <TabsTrigger value="recurring" className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Recurrentes
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="history">
                    <TransactionsPanel />
                </TabsContent>
                <TabsContent value="recurring">
                    <RecurringTransactionsList />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Transactions;