import Image from "next/image";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-black">
            {/* Left side: Login Form */}
            <div className="flex w-full flex-col justify-center p-8 sm:p-12 md:w-1/2 lg:p-24">
                <div className="mx-auto w-full max-w-sm flex flex-col items-center">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold font-serif mb-2">Bienvenido</h1>
                        <p className="text-sm text-zinc-500 font-medium">
                            Acceso exclusivo para administradores
                        </p>
                    </div>

                    <LoginForm />

                    <div className="mt-8 text-center text-xs text-zinc-400">
                        Sistema de Reservas UCE &copy; 2026
                    </div>
                </div>
            </div>

            {/* Right side: Image Cover */}
            <div className="relative hidden w-1/2 md:block">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000"
                    alt="Laboratory workspace with modern equipment"
                    fill
                    sizes="50vw"
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-12 lg:p-24 text-white">
                    <h2 className="text-5xl font-serif font-bold leading-tight mb-4">
                        Tu potencial es <br />infinito.
                    </h2>
                    <p className="max-w-md text-lg text-white/90">
                        El conocimiento es la herramienta más poderosa. Bienvenido a tu espacio de gestión y administración de laboratorios.
                    </p>
                </div>
            </div>
        </div>
    );
}
