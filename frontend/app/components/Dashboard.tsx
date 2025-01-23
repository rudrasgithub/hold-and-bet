'use client';

import dynamic from 'next/dynamic';

// Dynamically import the component to disable SSR
const CardBridgeShuffle = dynamic(() => import('../components/CardShuffle'), { ssr: false });


export default function Dashboard()  {
    return <div className="px-3 py-3 text-gray-50 min-h-screen bg-slate-600 rounded-lg">
        <h3>Welcome, Rudra</h3>
        <CardBridgeShuffle />
    </div>
}