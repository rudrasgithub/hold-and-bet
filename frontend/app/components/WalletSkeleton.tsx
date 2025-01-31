import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const WalletSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 space-y-8">
        {/* Skeleton for Balance Card */}
        <Card className="bg-gray-800 border-purple-600/20">
          <CardHeader>
            <CardTitle className="text-gray-400">
              <Skeleton className="h-6 w-40 bg-gray-700" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-48 bg-gray-700 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32 bg-gray-700 rounded-md" />
              <Skeleton className="h-10 w-32 bg-gray-700 rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Skeleton for Transaction History */}
        <Card className="bg-gray-800 border-purple-600/20">
          <CardHeader>
            <CardTitle className="text-gray-400">
              <Skeleton className="h-6 w-64 bg-gray-700" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Skeleton for Table Headers */}
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-6 w-full bg-gray-700" />
                <Skeleton className="h-6 w-full bg-gray-700" />
                <Skeleton className="h-6 w-full bg-gray-700" />
                <Skeleton className="h-6 w-full bg-gray-700" />
              </div>

              {/* Skeleton for Table Rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-6 w-full bg-gray-700" />
                  <Skeleton className="h-6 w-full bg-gray-700" />
                  <Skeleton className="h-6 w-full bg-gray-700" />
                  <Skeleton className="h-6 w-full bg-gray-700" />
                </div>
              ))}

              {/* Skeleton for Pagination */}
              <div className="flex justify-center gap-4 mt-4">
                <Skeleton className="h-10 w-32 bg-gray-700 rounded-md" />
                <Skeleton className="h-10 w-32 bg-gray-700 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};