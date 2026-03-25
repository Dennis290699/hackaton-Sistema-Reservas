import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden ${className || ''}`} {...props}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return <div className={`px-6 py-4 border-b border-gray-100 ${className || ''}`} {...props}>{children}</div>;
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => {
    return <h3 className={`text-lg font-semibold text-gray-900 ${className || ''}`} {...props}>{children}</h3>;
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return <div className={`p-6 ${className || ''}`} {...props}>{children}</div>;
};
