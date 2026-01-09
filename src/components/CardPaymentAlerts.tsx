import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CreditCard, BANK_CONFIGS } from "../types/creditCard";
import { Transaction } from "../types/transaction";
import { AlertTriangle, Calendar, CreditCard as CreditCardIcon, Clock, DollarSign } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface CardPaymentAlertsProps {
    creditCards: CreditCard[];
    transactions?: Transaction[];
    daysBeforeAlert?: number; // Días antes para mostrar alerta (default: 3)
}

interface CardAlert {
    card: CreditCard;
    type: 'payment' | 'cutoff' | 'expiration' | 'payment_due';
    daysUntil: number;
    date: Date;
    amount?: number; // Monto a pagar (para payment_due)
}

const CardPaymentAlerts = ({ creditCards, transactions = [], daysBeforeAlert = 3 }: CardPaymentAlertsProps) => {
    const alerts = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const cardAlerts: CardAlert[] = [];

        creditCards.forEach(card => {
            // Calcular próxima fecha de pago
            let paymentDate = new Date(currentYear, currentMonth, card.payment_day);
            if (paymentDate < today) {
                paymentDate = new Date(currentYear, currentMonth + 1, card.payment_day);
            }
            
            // Calcular próxima fecha de corte
            let cutoffDate = new Date(currentYear, currentMonth, card.cutoff_day);
            if (cutoffDate < today) {
                cutoffDate = new Date(currentYear, currentMonth + 1, card.cutoff_day);
            }

            // Calcular días restantes para pago
            const paymentDiff = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Calcular días restantes para corte
            const cutoffDiff = Math.ceil((cutoffDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Alertar si falta poco para pago (según daysBeforeAlert)
            if (paymentDiff <= daysBeforeAlert && paymentDiff >= 0) {
                cardAlerts.push({
                    card,
                    type: 'payment',
                    daysUntil: paymentDiff,
                    date: paymentDate,
                    amount: card.current_balance || 0,
                });
            }

            // Alertar si falta poco para corte
            if (cutoffDiff <= daysBeforeAlert && cutoffDiff >= 0) {
                cardAlerts.push({
                    card,
                    type: 'cutoff',
                    daysUntil: cutoffDiff,
                    date: cutoffDate,
                });
            }

            // Verificar fecha de expiración de la tarjeta
            if (card.expiration_date) {
                const [expMonth, expYear] = card.expiration_date.split('/');
                const fullYear = expYear.length === 2 ? 2000 + parseInt(expYear) : parseInt(expYear);
                // La tarjeta expira el último día del mes
                const expirationDate = new Date(fullYear, parseInt(expMonth), 0);
                expirationDate.setHours(23, 59, 59, 999);
                
                const expirationDiff = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                // Alertar si faltan 30 días o menos para expirar
                if (expirationDiff <= 30 && expirationDiff >= 0) {
                    cardAlerts.push({
                        card,
                        type: 'expiration',
                        daysUntil: expirationDiff,
                        date: expirationDate,
                    });
                }
            }
        });

        // Alertas basadas en transacciones con fechas de pago próximas
        // Agrupar transacciones por tarjeta y fecha de pago
        const paymentDueDates = new Map<string, { card: CreditCard; dueDate: Date; totalAmount: number }>();
        
        transactions.forEach(tx => {
            if (tx.credit_card_id && tx.payment_due_date && tx.type === 'expense') {
                const dueDate = new Date(tx.payment_due_date);
                dueDate.setHours(0, 0, 0, 0);
                const dueDiff = differenceInDays(dueDate, today);
                
                // Solo mostrar si está próximo a vencer y no ha pasado
                if (dueDiff <= daysBeforeAlert && dueDiff >= 0) {
                    const card = creditCards.find(c => c.id === tx.credit_card_id);
                    if (card) {
                        const key = `${tx.credit_card_id}-${tx.payment_due_date}`;
                        const existing = paymentDueDates.get(key);
                        if (existing) {
                            existing.totalAmount += tx.amount;
                        } else {
                            paymentDueDates.set(key, {
                                card,
                                dueDate,
                                totalAmount: tx.amount,
                            });
                        }
                    }
                }
            }
        });

        // Agregar alertas de transacciones con fecha de pago próxima
        paymentDueDates.forEach(({ card, dueDate, totalAmount }) => {
            const dueDiff = differenceInDays(dueDate, today);
            cardAlerts.push({
                card,
                type: 'payment_due',
                daysUntil: dueDiff,
                date: dueDate,
                amount: totalAmount,
            });
        });

        return cardAlerts.sort((a, b) => a.daysUntil - b.daysUntil);
    }, [creditCards, transactions, daysBeforeAlert]);

    if (alerts.length === 0) {
        return null;
    }

    const getBankName = (card: CreditCard) => {
        if (card.bank === 'otro' && card.bank_name) {
            return card.bank_name;
        }
        return card.bank ? BANK_CONFIGS[card.bank].name : 'Otro';
    };

    const getBankColor = (card: CreditCard) => {
        const bank = card.bank || 'otro';
        return BANK_CONFIGS[bank].primaryColor;
    };

    return (
        <div className="space-y-3">
            {alerts.map((alert, index) => (
                <Alert 
                    key={`${alert.card.id}-${alert.type}-${index}`}
                    variant="destructive"
                    className="border-l-4"
                    style={{ borderLeftColor: getBankColor(alert.card) }}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                            <AlertTitle className="flex items-center gap-2">
                                <CreditCardIcon className="h-4 w-4" />
                                {alert.card.name}
                                <span className="text-xs font-normal text-muted-foreground">
                                    ({getBankName(alert.card)})
                                </span>
                            </AlertTitle>
                            <AlertDescription className="mt-1">
                                {alert.type === 'payment' ? (
                                    alert.daysUntil === 0 ? (
                                        <span className="font-semibold">
                                            ¡Hoy es tu fecha límite de pago! 
                                            {alert.amount && alert.amount > 0 && (
                                                <span> Deuda pendiente: ${alert.amount.toLocaleString("es-MX")}</span>
                                            )}
                                        </span>
                                    ) : alert.daysUntil === 1 ? (
                                        <span>
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            Mañana es tu fecha límite de pago (día {alert.card.payment_day}).
                                            {alert.amount && alert.amount > 0 && (
                                                <span> Deuda pendiente: ${alert.amount.toLocaleString("es-MX")}</span>
                                            )}
                                        </span>
                                    ) : (
                                        <span>
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            Tu fecha límite de pago es en {alert.daysUntil} días (día {alert.card.payment_day}).
                                            {alert.amount && alert.amount > 0 && (
                                                <span> Deuda pendiente: ${alert.amount.toLocaleString("es-MX")}</span>
                                            )}
                                        </span>
                                    )
                                ) : alert.type === 'cutoff' ? (
                                    alert.daysUntil === 0 ? (
                                        <span className="font-semibold">
                                            ¡Hoy es tu fecha de corte! Los gastos a partir de mañana se reflejarán en el siguiente estado de cuenta.
                                        </span>
                                    ) : alert.daysUntil === 1 ? (
                                        <span>
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            Mañana es tu fecha de corte (día {alert.card.cutoff_day}). Los gastos de hoy aún entran en este periodo.
                                        </span>
                                    ) : (
                                        <span>
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            Tu fecha de corte es en {alert.daysUntil} días (día {alert.card.cutoff_day}).
                                        </span>
                                    )
                                ) : alert.type === 'payment_due' ? (
                                    <span>
                                        <DollarSign className="h-3 w-3 inline mr-1" />
                                        {alert.daysUntil === 0 ? (
                                            <span className="font-semibold">
                                                ¡Hoy vence el pago de ${alert.amount?.toLocaleString("es-MX")} del corte del {format(alert.date, "d 'de' MMMM", { locale: es })}!
                                            </span>
                                        ) : alert.daysUntil === 1 ? (
                                            <span className="font-semibold">
                                                Mañana vence el pago de ${alert.amount?.toLocaleString("es-MX")} del estado de cuenta.
                                            </span>
                                        ) : (
                                            <span>
                                                Tienes un pago de ${alert.amount?.toLocaleString("es-MX")} que vence el {format(alert.date, "d 'de' MMMM", { locale: es })} ({alert.daysUntil} días).
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span>
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {alert.daysUntil === 0 ? (
                                            <span className="font-semibold">
                                                ¡Tu tarjeta expira hoy! Contacta a tu banco para renovarla.
                                            </span>
                                        ) : alert.daysUntil === 1 ? (
                                            <span className="font-semibold">
                                                ¡Tu tarjeta expira mañana! Contacta a tu banco para renovarla.
                                            </span>
                                        ) : alert.daysUntil <= 7 ? (
                                            <span className="font-semibold">
                                                Tu tarjeta expira en {alert.daysUntil} días ({alert.card.expiration_date}). Solicita tu renovación pronto.
                                            </span>
                                        ) : (
                                            <span>
                                                Tu tarjeta expira en {alert.daysUntil} días ({alert.card.expiration_date}). Considera solicitar tu renovación.
                                            </span>
                                        )}
                                    </span>
                                )}
                            </AlertDescription>
                        </div>
                    </div>
                </Alert>
            ))}
        </div>
    );
};

export default CardPaymentAlerts;
