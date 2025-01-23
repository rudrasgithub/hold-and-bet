'use client';

import { useSession } from "next-auth/react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

export default function Page() {
  const session = useSession();

  return (
    <div>
      {!session.data?.user? <LandingPage /> : 
        (
          <div>
            <Dashboard />
          </div>
        )
      }
    </div>
  )
}