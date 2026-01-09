export interface SavingsGoal {
    id: string;
    user_id: string | null;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    icon: string;
    color: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface GoalContribution {
    id: string;
    goal_id: string;
    amount: number;
    account_id: string | null;
    note: string | null;
    created_at: string;
}

export const GOAL_ICONS = [
    { id: "plane", label: "Vacaciones", emoji: "✈️" },
    { id: "car", label: "Auto", emoji: "🚗" },
    { id: "home", label: "Casa", emoji: "🏠" },
    { id: "graduation", label: "Educación", emoji: "🎓" },
    { id: "ring", label: "Boda", emoji: "💍" },
    { id: "baby", label: "Bebé", emoji: "👶" },
    { id: "laptop", label: "Tecnología", emoji: "💻" },
    { id: "emergency", label: "Emergencia", emoji: "🆘" },
    { id: "gift", label: "Regalo", emoji: "🎁" },
    { id: "piggy", label: "Ahorro general", emoji: "🐷" },
    { id: "health", label: "Salud", emoji: "🏥" },
    { id: "celebration", label: "Celebración", emoji: "🎉" },
];

export const GOAL_COLORS = [
    { id: "blue", value: "#3B82F6", label: "Azul" },
    { id: "green", value: "#22C55E", label: "Verde" },
    { id: "purple", value: "#A855F7", label: "Morado" },
    { id: "orange", value: "#F97316", label: "Naranja" },
    { id: "pink", value: "#EC4899", label: "Rosa" },
    { id: "teal", value: "#14B8A6", label: "Turquesa" },
    { id: "red", value: "#EF4444", label: "Rojo" },
    { id: "yellow", value: "#EAB308", label: "Amarillo" },
];
