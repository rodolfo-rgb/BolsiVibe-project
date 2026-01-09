export type FrequencyType = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export interface RecurringTransaction {
    id: string;
    user_id: string | null;
    type: "income" | "expense";
    amount: number;
    description: string;
    frequency: FrequencyType;
    day_of_month?: number; // Para frecuencia mensual (1-31)
    day_of_week?: number; // Para frecuencia semanal (0-6, domingo-sábado)
    next_execution_date: string;
    account_id: string | null;
    credit_card_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
    daily: "Diario",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
    yearly: "Anual",
};

export const DAYS_OF_WEEK = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
];
