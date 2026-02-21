import React, { useEffect } from 'react';

export default function Skeleton({ width, height, borderRadius, count = 1, style }) {
    useEffect(() => {
        if (document.getElementById('ff-skeleton-styles')) return;
        const styleTag = document.createElement('style');
        styleTag.id = 'ff-skeleton-styles';
        styleTag.innerHTML = `
      .ff-skeleton {
        display: block;
        background: linear-gradient(90deg, var(--surface-2) 25%, var(--border-light) 50%, var(--surface-2) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
      }
    `;
        document.head.appendChild(styleTag);
    }, []);

    const skeletonStyle = {
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || '4px',
        marginBottom: count > 1 ? '0.5rem' : '0',
        ...style
    };

    if (count > 1) {
        return (
            <>
                {Array.from({ length: count }).map((_, i) => (
                    <span key={i} className="ff-skeleton" style={skeletonStyle} />
                ))}
            </>
        );
    }

    return <span className="ff-skeleton" style={skeletonStyle} />;
}
