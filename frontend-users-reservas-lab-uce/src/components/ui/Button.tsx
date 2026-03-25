import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    const variants = {
        primary: 'bg-black text-white hover:bg-gray-800 shadow-sm border border-black',
        secondary: 'bg-white text-black border border-gray-200 hover:bg-gray-50 shadow-sm',
        outline: 'border border-gray-200 bg-transparent hover:border-black hover:bg-black hover:text-white transition-all text-gray-700',
        ghost: 'bg-transparent hover:bg-gray-50 text-gray-600 hover:text-black',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100',
        link: 'bg-transparent text-black hover:underline underline-offset-4 p-0 shadow-none',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs font-medium uppercase tracking-wide',
        md: 'px-5 py-2.5 text-sm font-medium',
        lg: 'px-8 py-3 text-base font-medium',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
