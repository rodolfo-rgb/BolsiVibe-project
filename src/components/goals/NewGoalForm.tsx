import { useState } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { GOAL_ICONS, GOAL_COLORS } from "../../types/savings-goal";

interface NewGoalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        target_amount: number;
        deadline?: string;
        icon: string;
        color: string;
    }) => Promise<void>;
}

const NewGoalForm = ({ isOpen, onClose, onSubmit }: NewGoalFormProps) => {
    const { toast } = useToast();
    const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0].id);
    const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0].value);

    const form = useForm({
        defaultValues: {
            name: "",
            target_amount: 10000,
            deadline: "",
        },
    });

    const handleSubmit = async (data: any) => {
        if (!data.name) {
            toast({
                title: "Error",
                description: "Por favor ingresa un nombre para la meta.",
                variant: "destructive",
            });
            return;
        }

        if (data.target_amount < 100) {
            toast({
                title: "Error",
                description: "El monto objetivo debe ser al menos $100.",
                variant: "destructive",
            });
            return;
        }

        try {
            await onSubmit({
                name: data.name,
                target_amount: data.target_amount,
                deadline: data.deadline || undefined,
                icon: selectedIcon,
                color: selectedColor,
            });

            form.reset();
            setSelectedIcon(GOAL_ICONS[0].id);
            setSelectedColor(GOAL_COLORS[0].value);
            onClose();

            toast({
                title: "Meta creada",
                description: "Tu meta de ahorro ha sido creada exitosamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo crear la meta. Intenta de nuevo.",
                variant: "destructive",
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="flex flex-col h-full overflow-hidden">
                <SheetHeader>
                    <SheetTitle>Nueva Meta de Ahorro</SheetTitle>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4 flex-1 overflow-y-auto pb-4">
                        {/* Nombre */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la meta</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Vacaciones a la playa" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Monto objetivo */}
                        <FormField
                            control={form.control}
                            name="target_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto objetivo</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="100"
                                            placeholder="10000"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Fecha límite */}
                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha límite (opcional)</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Selección de ícono */}
                        <div className="space-y-2">
                            <FormLabel>Ícono</FormLabel>
                            <div className="grid grid-cols-6 gap-2">
                                {GOAL_ICONS.map((icon) => (
                                    <button
                                        key={icon.id}
                                        type="button"
                                        onClick={() => setSelectedIcon(icon.id)}
                                        className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-105 ${
                                            selectedIcon === icon.id
                                                ? "border-primary bg-primary/10"
                                                : "border-muted hover:border-muted-foreground/50"
                                        }`}
                                        title={icon.label}
                                    >
                                        {icon.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selección de color */}
                        <div className="space-y-2">
                            <FormLabel>Color</FormLabel>
                            <div className="flex gap-2 flex-wrap">
                                {GOAL_COLORS.map((color) => (
                                    <button
                                        key={color.id}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-10 h-10 rounded-full transition-all hover:scale-110 ${
                                            selectedColor === color.value
                                                ? "ring-2 ring-offset-2 ring-primary"
                                                : ""
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-4 rounded-lg bg-secondary/50 border">
                            <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: `${selectedColor}20` }}
                                >
                                    {GOAL_ICONS.find((i) => i.id === selectedIcon)?.emoji}
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {form.watch("name") || "Tu meta"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        ${form.watch("target_amount")?.toLocaleString("es-ES") || "0"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            Crear Meta
                        </Button>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
};

export default NewGoalForm;
