import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LandingSkeleton() {
    return (
        <div
            className="pt-6 flex flex-col min-h-screen transition-colors duration-300 dark:bg-gray-900 text-gray-50"
        >
            <div className="flex-1">
                <div className="relative py-20 md:py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-amber-500/10" />
                    <div className="container mx-auto px-4 md:px-8 relative">
                        <div className="grid gap-8 lg:grid-cols-[1fr_600px] xl:grid-cols-[1fr_700px]">
                            <div className="flex flex-col justify-center space-y-6">
                                <div className="space-y-4">
                                    <Skeleton className="h-8 w-72 bg-purple-600/50 rounded" />
                                    <Skeleton className="h-14 sm:h-16 xl:h-20 w-full max-w-[700px] bg-gradient-to-r from-purple-600/30 to-amber-500/30 rounded" />
                                    <Skeleton className="h-6 md:h-8 w-full max-w-[500px] bg-gray-700 rounded" />
                                </div>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Skeleton className="h-12 w-48 bg-purple-600/50 rounded-md" />
                                    <Skeleton className="h-12 w-48 bg-gray-700 rounded-md" />
                                </div>
                            </div>
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-amber-500/20 rounded-lg blur-3xl" />
                                <Skeleton className="h-96 w-full max-w-[600px] bg-gray-700 rounded-lg shadow-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
    