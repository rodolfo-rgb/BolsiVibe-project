import TransactionsPanel from "../components/TransactionPanel";

const Transactions = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Transacciones</h1>
            <TransactionsPanel />
        </div>
    );
};

export default Transactions;