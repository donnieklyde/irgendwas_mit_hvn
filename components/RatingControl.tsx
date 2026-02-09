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
        <div className="flex flex-col items-center gap-10 py-8 w-full max-w-lg relative group/rating">
            {/* Title */}
            <div className="text-center">
                <AnimatePresence mode="wait">
                    {displayValue !== null ? (
                        <motion.div
                            key={displayValue}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="text-8xl md:text-9xl font-playfair font-light text-white tracking-tight"
                        >
                            {displayValue}
                        </motion.div>
                    ) : (
                        <div className="text-8xl md:text-9xl font-playfair font-light text-white/5 tracking-tight">—</div>
                    )}
                </AnimatePresence>
            </div>

            {/* Rating Dots */}
            <div className="flex items-center justify-center gap-4 w-full flex-wrap px-4">
                {ratings.map((value) => {
                    const isActive = displayValue !== null && displayValue >= value;
                    const isSelected = selectedValue === value;

                    return (
                        <motion.button
                            key={value}
                            whileHover={{ scale: 1.4 }}
                            whileTap={{ scale: 0.8 }}
                            className={clsx(
                                "rounded-full transition-all duration-500 relative",
                                isActive ? "bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "bg-white/5 hover:bg-white/20 border border-white/5"
                            )}
                            style={{
                                width: isSelected ? '14px' : '10px',
                                height: isSelected ? '14px' : '10px',
                            }}
                            onMouseEnter={() => setHoverValue(value)}
                            onMouseLeave={() => setHoverValue(null)}
                            onClick={() => handleRate(value)}
                            aria-label={`Rate ${value} out of 10`}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="selected-ring"
                                    className="absolute inset-0 rounded-full border border-white/40 ring-4 ring-white/5"
                                    style={{ width: '22px', height: '22px', left: '-4px', top: '-4px' }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Labels */}
            <div className="flex justify-between w-full px-6 text-[8px] font-sans text-white/10 uppercase tracking-[0.4em] font-bold">
                <span>Echo</span>
                <span>Sublime</span>
            </div>

            {/* Confirmation */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        className="absolute -bottom-6 text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold"
                    >
                        Marked
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
