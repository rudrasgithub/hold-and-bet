'use client';

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { User, Wallet, Trophy, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileSkeleton } from "../components/ProfileSkeleton";
import { fetchUserProfile } from "@/store/thunks/profileThunks";
import useAuth from "@/lib/useAuth";

export default function ProfilePage() {
  const { session, status } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { userData, loading, error } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      dispatch(fetchUserProfile(session.user.token)); // Fetch the user profile based on token
    }
  }, [status, dispatch, session]);

  // Handle loading, error, and no userData scenarios
  if (loading) return <ProfileSkeleton />;
  if (error) return <div className="text-white text-center min-h-screen flex items-center justify-center">{error}</div>;
  if (!userData) return <div className="text-white text-center min-h-screen flex items-center justify-center">No User data available.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
          {/* Profile section */}
          <div className="flex flex-col items-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <Avatar className="h-32 w-32 ring-4 ring-purple-600 ring-offset-4 ring-offset-gray-900">
                {/* Check if image exists, otherwise fallback */}
                <AvatarImage src={userData.image || "/default-avatar.png"} alt={userData.name} />
                <AvatarFallback className="bg-purple-600">{userData.name[0]}</AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{userData.name}</h1>
              <p className="text-gray-400">Premium Player</p>
            </div>
          </div>

          {/* Stats section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Matches", value: `${userData.totalMatches}`, icon: Trophy },
              { label: "Total Wins", value: `${userData.totalWins}`, icon: Target },
              { label: "Win Rate", value: `${userData.winningRate}%`, icon: User },
              { label: "Total Profit", value: `₹${userData.totalProfit}`, icon: Wallet },
            ].map((stat, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="bg-gray-800 border-purple-600/20 hover:border-purple-600/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-200">{stat.label}</CardTitle>
                    <stat.icon className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-xs text-gray-400 mt-1">Lifetime {stat.label.toLowerCase()}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
