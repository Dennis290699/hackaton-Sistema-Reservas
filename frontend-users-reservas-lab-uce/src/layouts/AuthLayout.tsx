import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    imageSrc: string;
    reverse?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, imageSrc, reverse = false }) => {
    return (
        <div className={`flex min-h-screen w-full bg-white ${reverse ? 'flex-row-reverse' : ''}`}>
            {/* Left Side - Visual & Inspiration */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={imageSrc}
                        alt="Inspiration"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                <div className="relative z-10 p-12 text-white max-w-lg">
                    <h1 className="text-5xl font-serif font-medium mb-6 leading-tight tracking-tight">
                        {title}
                    </h1>
                    <p className="text-xl text-gray-200 font-light leading-relaxed">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {children}
                </div>
            </div>
        </div>
    );
};
