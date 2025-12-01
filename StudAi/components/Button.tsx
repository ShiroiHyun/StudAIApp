import React from 'react';
import { useApp } from '../context/AppContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    label: string;
    icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', label, icon, className, ...props }) => {
    const { preferences, speak } = useApp();

    let colorClasses = "";
    
    if (preferences.highContrast) {
        colorClasses = "bg-black border-2 border-yellow-300 text-yellow-300 hover:bg-gray-900";
    } else {
        switch (variant) {
            case 'primary': colorClasses = "bg-ucv-red text-white hover:bg-red-800"; break;
            case 'secondary': colorClasses = "bg-ucv-blue text-white hover:bg-blue-800"; break;
            case 'danger': colorClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300"; break;
        }
    }

    const sizeClass = preferences.fontSize === 'extra-large' ? 'p-6 text-2xl' : preferences.fontSize === 'large' ? 'p-4 text-xl' : 'p-3 text-lg';

    return (
        <button
            {...props}
            className={`rounded-xl font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 ${colorClasses} ${sizeClass} ${className || ''}`}
            onFocus={() => speak(label)}
            aria-label={label}
        >
            {icon && <i className={`fas ${icon}`}></i>}
            {label}
        </button>
    );
};
