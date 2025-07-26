import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, GitFork, MessageCircle, Bookmark, ExternalLink } from "lucide-react";
import type { Issue } from "@shared/schema";

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const updatedAt = new Date(date);
    const diffInHours = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-orange-100 text-orange-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-100 text-yellow-800',
      'TypeScript': 'bg-blue-100 text-blue-800',
      'Python': 'bg-green-100 text-green-800',
      'Go': 'bg-cyan-100 text-cyan-800',
      'Rust': 'bg-orange-100 text-orange-800',
      'Java': 'bg-red-100 text-red-800',
      'C++': 'bg-purple-100 text-purple-800',
      'C#': 'bg-indigo-100 text-indigo-800',
    };
    return colors[language] || 'bg-gray-100 text-gray-800';
  };

  const issueUrl = `https://github.com/${issue.repositoryOwner}/${issue.repositoryName}/issues/${issue.number}`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            {issue.isRecommended && (
              <Badge className="bg-green-500 text-white">
                Highly Recommended
              </Badge>
            )}
            {issue.labels?.includes('good first issue') && (
              <Badge variant="secondary">good first issue</Badge>
            )}
            {issue.labels?.includes('beginner friendly') && (
              <Badge className="bg-green-100 text-green-800">beginner friendly</Badge>
            )}
            {issue.labels?.includes('help wanted') && (
              <Badge className="bg-blue-100 text-blue-800">help wanted</Badge>
            )}
            {issue.difficulty && (
              <Badge className={getDifficultyColor(issue.difficulty)}>
                {issue.difficulty}
              </Badge>
            )}
          </div>
          <span className="text-xs text-github-gray">
            {getTimeAgo(issue.updatedAt!)}
          </span>
        </div>

        <div className="mb-3">
          <h3 className="text-lg font-semibold text-github-text mb-1">
            <a 
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-github-blue transition-colors"
            >
              {issue.title}
            </a>
          </h3>
          <p className="text-sm text-github-gray mb-2">
            <a 
              href={`https://github.com/${issue.repositoryOwner}/${issue.repositoryName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-github-blue transition-colors"
            >
              {issue.repositoryOwner}/{issue.repositoryName}
            </a>
          </p>
          {issue.body && (
            <p className="text-sm text-github-gray leading-relaxed line-clamp-3">
              {issue.body.length > 200 ? `${issue.body.substring(0, 200)}...` : issue.body}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-github-gray">
            <span className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>{issue.repositoryStars?.toLocaleString() || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <GitFork className="h-3 w-3" />
              <span>{issue.repositoryForks?.toLocaleString() || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{issue.comments || 0}</span>
            </span>
            {issue.language && (
              <Badge className={getLanguageColor(issue.language)}>
                {issue.language}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-github-gray hover:text-github-blue transition-colors p-1"
              onClick={handleBookmark}
            >
              <Bookmark className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-github-blue text-white px-3 py-1.5 text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <a 
                href={issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1"
              >
                <span>View Issue</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
