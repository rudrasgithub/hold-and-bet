'use client';

import { User, CreditCard, Settings, Mail, LogOut, UserPlus } from "lucide-react";
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
import Link from "next/link";

export const Navbar = () => {
    const session = useSession();
    return <div className="py-5 md:px-6 border-b transition-colors duration-300 flex justify-between">
        <div className="text-3xl font-bold text-gray-50">
            <Link href={'/'}>Hold & Bet</Link>
        </div>
        <div>
            {session.data?.user ?
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <Image
                            src={session.data.user.image ?? ""}
                            alt="User Avatar"
                            width={40}
                            height={40}
                            priority
                            className="rounded-full cursor-pointer"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border border-gray-300 rounded-md shadow-md">
                        <DropdownMenuLabel className="text-gray-700">
                            <span className="font-light">Signed in as:</span><br />
                            <span className="font-semibold">{session.data.user.email}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                            <hr />
                            <DropdownMenuItem className="hover:bg-gray-200 cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-200 cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-200 cursor-pointer">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Wallet
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-200 cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Transactions
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-200 cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Referral
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-200 cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Rewards
                            </DropdownMenuItem>
                        <DropdownMenuSeparator />
                            <hr />
                            <DropdownMenuItem className="hover:bg-gray-200 cursor-pointer">
                                <Mail className="mr-2 h-4 w-4" />
                                Contact Us
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => signOut()} className="hover:bg-red-300 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </DropdownMenuContent>
                </DropdownMenu>
                : <Button className="bg-purple-600 text-white" onClick={(e) => {
                    e.preventDefault();
                    signIn();
                }}><UserPlus />Sign Up</Button>
            }
        </div>
    </div>
}