import React, { type ReactNode } from 'react';
import { Navbar } from './Navbar';


interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    // SessionTimer is now handled in Dashboard or could be put here if global
    // But standard requirement was dashboard display.
    // If we want it GLOBAL, we should put <SessionTimer /> here but position absolute or in Navbar.
    // For now, let's remove the hook usage since we switched to SessionTimer component.
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {children}
            </main>
            <footer className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Universidad Central del Ecuador.</p>
                    <p>Facultad de Ingeniería</p>
                </div>
            </footer>
        </div>
    );
};
