"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/services/auth.service";

const loginSchema = z.object({
    correoElectronico: z.string().email({ message: "Correo inválido" }),
    contrasena: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            correoElectronico: "",
            contrasena: "",
        },
    });

    async function onSubmit(data: LoginFormValues) {
        setIsLoading(true);
        try {
            await AuthService.login(data);
            toast.success("Ingreso exitoso");
            router.push("/dashboard");
        } catch (err: unknown) {
            toast.error((err as Error).message || "Error al iniciar sesión", {
                duration: 8000, 
                position: "bottom-center"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">

                <FormField
                    control={form.control}
                    name="correoElectronico"
                    render={({ field }) => (
                        <FormItem>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 text-zinc-400 w-5 h-5 z-10" />
                                <FormControl>
                                    <Input
                                        placeholder="Correo Institucional"
                                        className="pl-10 rounded-xl h-12 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                        autoComplete="email"
                                        {...field}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contrasena"
                    render={({ field }) => (
                        <FormItem>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 text-zinc-400 w-5 h-5 z-10" />
                                <FormControl>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Contraseña"
                                        className="pl-10 pr-10 rounded-xl h-12 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                        autoComplete="current-password"
                                        {...field}
                                    />
                                </FormControl>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 z-10"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="text-right">
                    <a
                        href="#"
                        className="text-xs text-zinc-500 hover:text-black dark:hover:text-white hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-medium mt-4 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    disabled={isLoading}
                >
                    {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
            </form>
        </Form>
    );
}
