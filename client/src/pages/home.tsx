import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { IssueCard } from "@/components/issue-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Issue, IssueFilters } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<IssueFilters>({
    difficulty: ['beginner'],
    page: 1,
    limit: 10,
    sortBy: 'recent'
  });

  // Sync issues mutation
  const syncIssuesMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/sync-issues'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Issues synced successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sync issues",
        variant: "destructive"
      });
    }
  });

  // Create user from GitHub username
  const createUserMutation = useMutation({
    mutationFn: (username: string) => apiRequest('POST', `/api/users/github/${username}`),
    onSuccess: (response) => {
      return response.json().then((userData) => {
        setCurrentUser(userData);
        toast({
          title: "Success",
          description: "GitHub profile connected successfully!"
        });
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect GitHub profile",
        variant: "destructive"
      });
    }
  });

  // Get stats
  const { data: stats } = useQuery<{
    totalIssues: number;
    recommendedIssues: number;
    newIssues: number;
    topLanguages: Array<{ name: string; count: number }>;
    difficultyCounts: Record<string, number>;
  }>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get issues
  const { data: issuesData, isLoading: issuesLoading, error: issuesError } = useQuery<{
    issues: Issue[];
    total: number;
  }>({
    queryKey: ['/api/issues', filters],
    enabled: !!stats, // Only fetch when stats are available
  });

  // Get recommended issues for current user
  const { data: recommendedData, isLoading: recommendedLoading } = useQuery<{
    issues: Issue[];
    total: number;
  }>({
    queryKey: ['/api/users', currentUser?.id, 'recommended-issues', filters],
    enabled: !!currentUser,
  });

  // Auto-sync issues on first load if no issues exist
  useEffect(() => {
    if (stats && stats.totalIssues === 0) {
      syncIssuesMutation.mutate();
    }
  }, [stats]);

  // Auto-connect user if GitHub username is in localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('github_username');
    if (savedUsername && !currentUser) {
      createUserMutation.mutate(savedUsername);
    }
  }, []);

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    toast({
      title: "Search",
      description: `Searching for: ${query}`,
    });
  };

  const handleFiltersChange = (newFilters: Partial<IssueFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as any, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleConnectGitHub = () => {
    const username = prompt("Enter your GitHub username:");
    if (username) {
      localStorage.setItem('github_username', username);
      createUserMutation.mutate(username);
    }
  };

  const displayData = currentUser && recommendedData ? recommendedData : issuesData;
  const isLoading = currentUser ? recommendedLoading : issuesLoading;

  const currentPage = filters.page || 1;
  const totalPages = displayData ? Math.ceil(displayData.total / (filters.limit || 10)) : 0;

  return (
    <div className="min-h-screen bg-white">
      <Header currentUser={currentUser || undefined} onSearch={handleSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar
              currentUser={currentUser || undefined}
              availableLanguages={stats?.topLanguages || []}
              difficultyCounts={stats?.difficultyCounts || {}}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-github-text">
                    {currentUser ? 'Recommended Issues' : 'GitHub Issues'}
                  </h2>
                  <p className="text-github-gray mt-1">
                    {currentUser 
                      ? 'Based on your GitHub activity and preferences'
                      : 'Discover beginner-friendly open source contributions'
                    }
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                  <Select value={filters.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-40 border-github-border bg-white focus:ring-github-blue">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recently updated</SelectItem>
                      <SelectItem value="stars">Most stars</SelectItem>
                      <SelectItem value="match">Best match</SelectItem>
                      <SelectItem value="comments">Most comments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncIssuesMutation.mutate()}
                    disabled={syncIssuesMutation.isPending}
                    className="border-github-border hover:bg-github-bg"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${syncIssuesMutation.isPending ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Connect GitHub Profile Button */}
              {!currentUser && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Connect your GitHub profile to get personalized recommendations</span>
                    <Button
                      size="sm"
                      onClick={handleConnectGitHub}
                      disabled={createUserMutation.isPending}
                      className="bg-github-blue hover:bg-blue-700"
                    >
                      {createUserMutation.isPending ? 'Connecting...' : 'Connect GitHub'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Stats Bar */}
              {stats && (
                <div className="flex items-center space-x-6 text-sm text-github-gray">
                  <span><strong>{displayData?.total || 0}</strong> issues found</span>
                  <span><strong>{stats.recommendedIssues}</strong> highly recommended</span>
                  <span><strong>{stats.newIssues}</strong> new this week</span>
                </div>
              )}
            </div>

            {/* Error State */}
            {issuesError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load issues. Please try refreshing the page or syncing new issues.
                </AlertDescription>
              </Alert>
            )}

            {/* Issue Cards */}
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))
              ) : displayData?.issues && displayData.issues.length > 0 ? (
                displayData.issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-github-gray">No issues found. Try adjusting your filters or sync new issues.</p>
                  <Button
                    className="mt-4 bg-github-blue hover:bg-blue-700"
                    onClick={() => syncIssuesMutation.mutate()}
                    disabled={syncIssuesMutation.isPending}
                  >
                    {syncIssuesMutation.isPending ? 'Syncing...' : 'Sync Issues'}
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {displayData && displayData.total > (filters.limit || 10) && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-github-gray">
                    Showing {((currentPage - 1) * (filters.limit || 10)) + 1}-{Math.min(currentPage * (filters.limit || 10), displayData.total)} of {displayData.total} issues
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="border-github-border hover:bg-github-bg"
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <Button
                        key={page}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={isActive 
                          ? "bg-github-blue text-white hover:bg-blue-700" 
                          : "border-github-border hover:bg-github-bg"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-github-gray">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="border-github-border hover:bg-github-bg"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="border-github-border hover:bg-github-bg"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
