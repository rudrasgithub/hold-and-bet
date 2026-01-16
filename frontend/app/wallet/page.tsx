'use client';

import { useState, useEffect, useCallback } from "react";
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";
const paymentlink = process.env.NEXT_PUBLIC_PAYMENT_LINK;

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

const WalletPage = () => {
  const { session, status } = useAuth();
  const dispatch = useDispatch();
  const walletData = useSelector((state: RootState) => state.wallet);
  const [isWithdrawing, setisWithdrawing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false,
  });
  const [paginatedTransactions, setPaginatedTransactions] = useState<Transaction[]>([]);
  const itemsPerPage = 5;

  const fetchWalletData = useCallback(async (page: number = 1) => {
    if (session?.user?.token) {
      try {
        console.log('Fetching wallet from:', `${BACKEND_URL}/wallet?page=${page}&limit=${itemsPerPage}`);
        
        const response = await fetch(`${BACKEND_URL}/wallet?page=${page}&limit=${itemsPerPage}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch wallet data');
        }
        
        const { wallet, transactions, pagination: paginationData } = await response.json();
        dispatch(setWalletData({ walletId: wallet.id, balance: wallet.balance, transactions: [] }));
        setPaginatedTransactions(transactions);
        setPagination(paginationData);
        setCurrentPage(page);
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Error fetching wallet data:", err.message || error);
        toast.error(err.message || "Failed to fetch wallet data");
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No token found in session");
      setLoading(false);
    }
  }, [session?.user?.token, dispatch, itemsPerPage]);

  // Check for successful payment redirect and refresh wallet
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('success');
    const paymentCanceled = urlParams.get('canceled');
    
    if (paymentSuccess === 'true') {
      toast.success('Payment successful! Your balance will be updated shortly.');
      // Remove query params from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Delay fetch to give webhook time to process
      setTimeout(() => {
        fetchWalletData(1);
      }, 2000);
    } else if (paymentCanceled === 'true') {
      toast.error('Payment was canceled.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchWalletData]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWalletData(1);
    }
  }, [status, fetchWalletData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setLoading(true);
      fetchWalletData(newPage);
    }
  };

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
    if (withdrawAmount > walletData.balance) {
      toast.error("Insufficient balance!");
      return;
    }
    if (!session?.user?.token) {
      toast.error("You must be logged in to withdraw.");
      return;
    }

    setisWithdrawing(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: withdrawAmount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Withdrawal failed');
      }

      const { newBalance, transactions: updatedTransactions } = await response.json();

      dispatch(updateBalance(newBalance));
      updatedTransactions.forEach((transaction: Transaction) => dispatch(addTransaction(transaction)));
      toast.success(`Withdrawal of ₹${withdrawAmount} successful!`);
      setWithdrawAmount(0);
      setIsDialogOpen(false);
      // Refresh the transactions after withdrawal
      fetchWalletData(1);
    } catch (error) {
      const err = error as Error;
      console.error("Error processing withdrawal:", err.message || error);
      toast.error(err.message || "Withdrawal failed. Please try again.");
    } finally {
      setisWithdrawing(false);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-4 sm:mb-6 md:mb-8 bg-gray-800 border-purple-600/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-gray-200">Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                ₹{walletData.balance.toFixed(2)}
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
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
                        disabled={isWithdrawing || withdrawAmount <= 0}
                        onClick={handleWithdrawal}
                      >
                        {isWithdrawing ? "Processing..." : "Request Withdrawal"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-purple-600/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-gray-200">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400 text-xs sm:text-sm">Time</TableHead>
                      <TableHead className="text-gray-400 text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="text-gray-400 text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-gray-400 text-xs sm:text-sm hidden sm:table-cell">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction, index) => (
                      <TableRow key={index} className="border-gray-700">
                        <TableCell className="text-gray-300 text-xs sm:text-sm whitespace-nowrap">
                          {formatTimestamp(transaction.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 sm:gap-2">
                            {transaction.type === "BetWin" ? (
                              <TrendingUp className="text-green-500 h-3 w-3 sm:h-4 sm:w-4" />
                            ) : transaction.type === "Deposit" ? (
                              <TrendingUp className="text-green-500 h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <TrendingDown className="text-red-500 h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                            <span className="capitalize text-gray-300 text-xs sm:text-sm">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`font-medium text-xs sm:text-sm ${
                            transaction.type === "BetWin" || transaction.type === "Deposit"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          ₹{transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            {transaction.status === "Completed" ? (
                              <CheckCircle2 className="text-green-500 h-4 w-4" />
                            ) : (
                              <Clock className="text-yellow-500 h-4 w-4" />
                            )}
                            <span
                              className={`capitalize text-sm ${transaction.status === "Completed" ? "text-green-500" : "text-yellow-500"
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
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mt-4">
                <span className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                  Page {currentPage} of {pagination.totalPages} ({pagination.totalCount} total)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="border-purple-600/50 hover:bg-purple-600/20 text-white text-xs sm:text-sm"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasMore || loading}
                    className="border-purple-600/50 hover:bg-purple-600/20 text-white text-xs sm:text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletPage;
