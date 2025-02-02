import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6">
        <div className="space-y-8 animate-pulse">
          
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32 bg-gray-700" />
            <div className="text-center space-y-2">
              <div className="h-6 w-32 bg-gray-700 rounded-full mx-auto"></div>
              <div className="h-4 w-24 bg-gray-700 rounded-full mx-auto"></div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="bg-gray-800">
                <CardHeader className="space-y-2 pb-2">
                  <div className="h-4 w-20 bg-gray-700 rounded-full"></div>
                  <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-8 w-16 bg-gray-700 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-700 rounded-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
