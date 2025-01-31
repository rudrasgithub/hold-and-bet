'use client';

import { useSession } from "next-auth/react";
import LandingPage from "./components/LandingPage";
import LandingSkeleton from "./components/LandingSkeleton";

export default function Page() {
    const { status } = useSession();
    
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <LandingSkeleton />
            </div>
        );
    }

    return <LandingPage />;
}
