import React from 'react';
import Skeleton from './Skeleton';

export default function SkeletonTable({ rows = 5, cols = 4 }) {
    return (
        <div className="table-wrapper ff-card fade-in" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <Skeleton width="200px" height="2rem" />
                <Skeleton width="120px" height="2rem" />
            </div>
            <div className="data-table">
                <div style={{ display: 'flex', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: cols }).map((_, i) => (
                        <div key={i} style={{ flex: 1, padding: '0 1rem' }}>
                            <Skeleton height="1.25rem" />
                        </div>
                    ))}
                </div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', padding: '1rem 0', borderBottom: '1px solid var(--border-light)' }}>
                        {Array.from({ length: cols }).map((_, j) => (
                            <div key={j} style={{ flex: 1, padding: '0 1rem' }}>
                                <Skeleton height="1.1rem" width={j === 0 ? '60%' : '90%'} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
