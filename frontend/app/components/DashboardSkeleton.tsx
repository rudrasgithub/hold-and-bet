"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="container mx-auto px-4 pt-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="h-10 w-60 bg-gray-700 rounded animate-pulse mx-auto mb-2"></div>
                    <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mx-auto"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <Button className="bg-gray-700 text-gray-500 px-8 mb-5 rounded-xl shadow-lg cursor-not-allowed" disabled>
                                Loading...
                            </Button>
                        </motion.div>

                        <div className="pl-32 grid grid-cols-2 md:grid-cols-4 gap-1">
                            {[1, 2, 3, 4].map((_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0.9, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="w-40 h-60 bg-gray-700 rounded-lg animate-pulse"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 bg-gray-800 p-4 rounded-xl shadow-xl">
                        <div className="h-6 w-72 bg-gray-700 rounded animate-pulse mx-auto mb-3"></div>
                        <div className="h-4 w-72 bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-72 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-72 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-72 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-72 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-72 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-72 bg-gray-700 rounded animate-pulse"></div>

                        <div className="mt-6 flex gap-2 justify-center">
                            {[5, 10, 20, 50, 100, 200, 500].map((_, index) => (
                                <div key={index} className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
