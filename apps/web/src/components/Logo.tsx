import React from 'react';

export function Logo({ className = "h-8 w-8", ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
            {...props}
        >
            {/* Stylized Q / Quartz Hexagon combo */}
            <path 
                d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="opacity-90"
            />
            
            {/* Internal Clock/Structure */}
            <path 
                d="M12 6V12L16 14" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            
            {/* Quartz Shine/Reflection detail */}
            <path 
                d="M7 19.5L12 22L17 19.5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="opacity-50"
            />
        </svg>
    );
}
