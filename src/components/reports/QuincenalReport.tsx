import { useRef } from "react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "../ui/use-toast";
import { useAccounts } from "../../hooks/useAccounts";
import { useCreditCards } from "../../hooks/useCreditCards";
import { useTransactions } from "../../hooks/useTransactions";
import { Button } from "../ui/button";
import { FileDown } from "lucide-react";
import BalanceSection from "./sections/BalanceSection";
import AccountsSection from "./sections/AccountsSection";
import CreditCardsSection from "./sections/CreditCardsSection";
import TransactionsSection from "./sections/TransactionsSection";

const QuinceReport = () => {
    const { accounts, getTotalBalance } = useAccounts();
    const { creditCards } = useCreditCards();
    const { transactions } = useTransactions();
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);

    const calculateTotalIncome = () => {
        return transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const calculateTotalExpenses = () => {
        return transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const handleExportPDF = async () => {
        if (!reportRef.current) return;

        try {
            toast({
                title: "Generando PDF",
                description: "Por favor espere mientras se genera el reporte...",
            });

            const sections = reportRef.current.children;
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            let currentPage = 0;
            const margin = 15;
            const pageHeight = pdf.internal.pageSize.height;
            let yPosition = margin;

            pdf.setFontSize(16);
            pdf.text("Reporte Quincenal", margin, yPosition);
            yPosition += 10;

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i] as HTMLElement;

                const canvas = await html2canvas(section, {
                    logging: false,
                    useCORS: true,
                    background: "#ffffff",
                    width: section.scrollWidth,
                    height: section.scrollHeight,
                });

                const imgWidth = pdf.internal.pageSize.width - 2 * margin;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (yPosition + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    currentPage++;
                    yPosition = margin;
                }

                const imgData = canvas.toDataURL("image/png", 1.0);
                pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + margin;
            }

            pdf.save(`reporte-quincenal-${format(new Date(), "dd-MM-yyyy")}.pdf`);

            toast({
                title: "PDF Generado",
                description: "El reporte ha sido exportado exitosamente.",
            });
        } catch (error) {
            console.error("Error al generar PDF:", error);
            toast({
                title: "Error",
                description: "Hubo un error al generar el PDF. Por favor intente nuevamente.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Reporte Quincenal</h1>
                <Button onClick={handleExportPDF} className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Exportar PDF
                </Button>
            </div>

            <div ref={reportRef} className="space-y-6">
                <BalanceSection
                    totalBalance={getTotalBalance()}
                    totalIncome={calculateTotalIncome()}
                    totalExpenses={calculateTotalExpenses()}
                />
                <AccountsSection accounts={accounts} />
                <CreditCardsSection creditCards={creditCards} />
                <TransactionsSection transactions={transactions} />
            </div>
        </div>
    );
};

export default QuinceReport;