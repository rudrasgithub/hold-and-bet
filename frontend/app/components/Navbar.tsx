'use client';

import { User, CreditCard, LogOut, LogIn, LayoutDashboard } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NavSkeleton } from "./NavSkeleton";

export const Navbar = () => {
    const { data: sessionData, status } = useSession();  // Destructure data and status
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <div className="relative mb-7 top-3 left-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-purple-600 to-indigo-600/70 py-2.5 px-8 rounded-full shadow-lg flex justify-between items-center">
            <div
                onClick={() => handleNavigation("/")}
                className="text-3xl font-bold text-white cursor-pointer"
            >
                Hold & Bet
            </div>
            <div>
                {status === "loading" ? (
                    <NavSkeleton className="w-10 h-10 rounded-full" />
                ) : sessionData?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                            <Image
                                src={sessionData.user.image ?? ""}
                                alt="User Avatar"
                                width={40}
                                height={40}
                                priority
                                className="rounded-full cursor-pointer"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border border-gray-300 rounded-md shadow-md">
                            <DropdownMenuLabel className="text-gray-700">
                                <span className="font-light">Signed in as:</span>
                                <br />
                                <span className="font-semibold">{sessionData.user.email}</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleNavigation("/dashboard")}
                                className="hover:bg-gray-200 cursor-pointer"
                            >
                                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleNavigation("/profile")}
                                className="hover:bg-gray-200 cursor-pointer"
                            >
                                <User className="mr-2 h-4 w-4" /> Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleNavigation("/wallet")}
                                className="hover:bg-gray-200 cursor-pointer"
                            >
                                <CreditCard className="mr-2 h-4 w-4" /> Wallet
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={async () => {
                                    await signOut({ redirect: false });
                                    setTimeout(() => {
                                        router.replace('/');
                                    }, 500);
                                }}
                                className="hover:bg-red-300 cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button
                        className="bg-white text-purple-600 flex items-center justify-center rounded-full shadow-md hover:bg-gray-100 transition"
                        onClick={(e) => {
                            e.preventDefault();
                            signIn("google", { callbackUrl: "/dashboard" });
                        }}
                    >
                        <LogIn className="h-6 w-6" />
                    </Button>
                )}
            </div>
        </div>
    );
};
