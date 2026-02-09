'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface RatingControlProps {
    poemId: string;
    onRate: (value: number) => void;
    initialValue?: number;
}

export default function RatingControl({ poemId, onRate, initialValue }: RatingControlProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [selectedValue, setSelectedValue] = useState<number | null>(initialValue || null);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRate = (value: number) => {
        setSelectedValue(value);
        onRate(value);
        setShowConfirm(true);
        setTimeout(() => setShowConfirm(false), 2000);
    };

    const ratings = Array.from({ length: 11 }, (_, i) => i);
    const displayValue = hoverValue ?? selectedValue;

    return (
        <div className="flex flex-col items-center gap-8 py-8 w-full max-w-lg relative">
            {/* Title */}
            <div className="text-center">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">Your Valuation</h3>
                <AnimatePresence mode="wait">
                    {displayValue !== null && (
                        <motion.div
                            key={displayValue}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-7xl font-serif font-light text-white"
                        >
                            {displayValue}
                        </motion.div>
                    )}
                </AnimatePresence>
                {displayValue === null && (
                    <div className="text-7xl font-serif font-light text-white/10">—</div>
                )}
            </div>

            {/* Rating Dots */}
            <div className="flex items-center justify-center gap-3 w-full flex-wrap">
                {ratings.map((value) => {
                    const isActive = displayValue !== null && displayValue >= value;
                    const isSelected = selectedValue === value;

                    return (
                        <motion.button
                            key={value}
                            whileHover={{ scale: 1.3 }}
                            whileTap={{ scale: 0.9 }}
                            className={clsx(
                                "rounded-full transition-all duration-300 relative",
                                isActive ? "bg-white shadow-lg shadow-white/20" : "bg-white/10 hover:bg-white/30"
                            )}
                            style={{
                                width: isSelected ? '16px' : '12px',
                                height: isSelected ? '16px' : '12px',
                            }}
                            onMouseEnter={() => setHoverValue(value)}
                            onMouseLeave={() => setHoverValue(null)}
                            onClick={() => handleRate(value)}
                            aria-label={`Rate ${value} out of 10`}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="selected-ring"
                                    className="absolute inset-0 rounded-full border-2 border-white"
                                    style={{ width: '24px', height: '24px', left: '-4px', top: '-4px' }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Labels */}
            <div className="flex justify-between w-full px-4 text-[9px] font-mono text-white/20 uppercase tracking-widest">
                <span>Void</span>
                <span>Transcendent</span>
            </div>

            {/* Confirmation */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -bottom-4 text-xs text-white/50 italic"
                    >
                        Recorded
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
