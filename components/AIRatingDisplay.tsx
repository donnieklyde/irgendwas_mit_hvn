'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface AIRatingDisplayProps {
    value: number; // 0-10
    analysis?: string | null;
}

export default function AIRatingDisplay({ value, analysis }: AIRatingDisplayProps) {
    const [expanded, setExpanded] = useState(false);

    // Refined color gradient
    const getColor = (v: number) => {
        if (v < 3) return 'from-blue-400 to-cyan-300';
        if (v < 5) return 'from-purple-400 to-blue-400';
        if (v < 7) return 'from-pink-400 to-purple-400';
        if (v < 9) return 'from-orange-400 to-pink-400';
        return 'from-yellow-300 to-orange-400';
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md">
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center cursor-pointer group w-full"
                onClick={() => setExpanded(!expanded)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="text-[9px] uppercase tracking-[0.3em] text-white/20 mb-4">Algorithmic Assessment</div>

                <div className="relative">
                    <div className={clsx(
                        "text-6xl font-serif font-light bg-gradient-to-br bg-clip-text text-transparent",
                        getColor(value)
                    )}>
                        {value}<span className="text-3xl text-white/30">/10</span>
                    </div>

                    {/* Glow effect */}
                    <div className={clsx(
                        "absolute inset-0 blur-2xl opacity-20 bg-gradient-to-br",
                        getColor(value)
                    )} />
                </div>

                {analysis && (
                    <motion.div
                        className="mt-6 flex items-center gap-2 text-white/30 text-xs"
                        animate={{ rotate: expanded ? 180 : 0 }}
                    >
                        <span className="uppercase tracking-wider">Analysis</span>
                        <ChevronDown size={14} />
                    </motion.div>
                )}
            </motion.button>

            <AnimatePresence>
                {expanded && analysis && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="w-full overflow-hidden"
                    >
                        <div className="glass-panel p-6 rounded-xl">
                            <div className="text-xs text-white/30 uppercase tracking-wider mb-3 font-mono">
                                // Protocol Output
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed font-light">
                                {analysis}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
