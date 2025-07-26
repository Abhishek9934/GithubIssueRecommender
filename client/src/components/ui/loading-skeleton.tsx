import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-white border border-github-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
            <div className="w-16 h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        
        <div className="mb-3">
          <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
          <div className="w-1/3 h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-full h-4 bg-gray-200 rounded mb-1"></div>
          <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
