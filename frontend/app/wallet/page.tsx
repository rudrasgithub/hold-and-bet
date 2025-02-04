'use client';

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WalletSkeleton } from "../components/WalletSkeleton";
import toast from 'react-hot-toast';
import { parseISO, format } from 'date-fns';
import { useDispatch, useSelector } from "react-redux";
import { setWalletData, addTransaction, updateBalance } from "@/store/slices/walletSlice";
import { Transaction } from "@/types";
import useAuth from "@/lib/useAuth";
import { RootState } from "@/store";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const paymentlink = process.env.NEXT_PUBLIC_PAYMENT_LINK;

const WalletPage = () => {
  const { session, status } = useAuth();
  const dispatch = useDispatch();
  const walletData = useSelector((state: RootState) => state.wallet);
  const [isWithdrawing, setisWithdrawing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 5;

  const fetchWalletData = useCallback(async () => {
    if (session?.user.token) {
      try {
        const response = await axios.get(`${BACKEND_URL}/wallet`, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        });
        const { wallet, transactions } = response.data;

        dispatch(setWalletData({ walletId: wallet.id, balance: wallet.balance, transactions }));
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No token found in session");
      setLoading(false);
    }
  }, [session?.user.token, dispatch]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWalletData();
    }
  }, [status, fetchWalletData]);

  const formatTimestamp = (date: string) => {
    try {
      const parsedDate = parseISO(date);
      return format(parsedDate, 'MMM dd, yyyy, hh:mm:ss a');
    } catch (error) {
      console.log(error)
      return "Invalid Date";
    }
  };

  const handleWithdrawal = async () => {
    if (withdrawAmount <= 0) {
      toast.error("Amount must be greater than 0!");
      return;
    }
    if (!session?.user?.token) {
      toast.error("You must be logged in to withdraw.");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/wallet/withdraw`,
        { amount: withdrawAmount },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        }
      );

      const { newBalance, transactions: updatedTransactions } = response.data;

      dispatch(updateBalance(newBalance));
      updatedTransactions.forEach((transaction: Transaction) => dispatch(addTransaction(transaction)));
      toast.success(`Withdrawal of ₹${withdrawAmount} successful!`);
      setisWithdrawing(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error("Withdrawal failed. Please try again.");
    }
  };

  if (loading) {
    return <WalletSkeleton />;
  }

  if (!walletData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        No wallet data available.
      </div>
    );
  }

  const totalPages = Math.ceil(walletData.transactions.length / itemsPerPage);
  const currentTransactions = walletData.transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) as Transaction[];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-8 bg-gray-800 border-purple-600/20">
            <CardHeader>
              <CardTitle className="text-gray-200">Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                ₹{walletData.balance.toFixed(2)}
              </div>
              <div className="mt-4 flex gap-4">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  onClick={() => {
                    window.location.href = `${paymentlink}?prefilled_email=${session?.user.email}&prefilled_customer_name=${session?.user.name}&client_reference_id=${walletData.walletId}`;
                  }}
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Deposit
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-purple-600/50 hover:bg-purple-600/20 text-white flex items-center gap-2"
                    >
                      <ArrowDownCircle className="h-4 w-4" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        min="10"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={loading}
                        onClick={() => {
                          setisWithdrawing(true)
                          handleWithdrawal();
                        }}
                      >
                        {!isWithdrawing ? "Request Withdrawal" : "Processing"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-purple-600/20">
            <CardHeader>
              <CardTitle className="text-gray-200">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Time</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.map((transaction, index) => (
                    <TableRow key={index} className="border-gray-700">
                      <TableCell className="text-gray-300">
                        {formatTimestamp(transaction.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === "BetWin" ? (
                            <TrendingUp className="text-green-500 h-4 w-4" />
                          ) : transaction.type === "Deposit" ? (
                            <TrendingUp className="text-green-500 h-4 w-4" />
                          ) : (
                            <TrendingDown className="text-red-500 h-4 w-4" />
                          )}
                          <span className="capitalize text-gray-300">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`font-medium ${
                          transaction.type === "BetWin" || transaction.type === "Deposit"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        ₹{transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.status === "Completed" ? (
                            <CheckCircle2 className="text-green-500 h-4 w-4" />
                          ) : (
                            <Clock className="text-yellow-500 h-4 w-4" />
                          )}
                          <span
                            className={`capitalize ${transaction.status === "Completed" ? "text-green-500" : "text-yellow-500"
                              }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-purple-600/50 hover:bg-purple-600/20 text-white"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-purple-600/50 hover:bg-purple-600/20 text-white"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletPage;
