import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

interface SidebarProps {
  currentUser?: User;
  availableLanguages: Array<{ name: string; count: number }>;
  difficultyCounts: Record<string, number>;
  onFiltersChange: (filters: any) => void;
}

export function Sidebar({ currentUser, availableLanguages, difficultyCounts, onFiltersChange }: SidebarProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['beginner']);
  const [repositorySize, setRepositorySize] = useState<string>('any');

  const handleLanguageChange = (language: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedLanguages, language]
      : selectedLanguages.filter(l => l !== language);
    setSelectedLanguages(updated);
    updateFilters({ languages: updated });
  };

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedDifficulties, difficulty]
      : selectedDifficulties.filter(d => d !== difficulty);
    setSelectedDifficulties(updated);
    updateFilters({ difficulty: updated });
  };

  const handleRepositorySizeChange = (size: string) => {
    setRepositorySize(size);
    updateFilters({ repositorySize: size });
  };

  const updateFilters = (newFilters: any) => {
    onFiltersChange({
      languages: selectedLanguages,
      difficulty: selectedDifficulties,
      repositorySize,
      ...newFilters
    });
  };

  const applyFilters = () => {
    updateFilters({});
  };

  return (
    <aside className="space-y-6">
      {/* User GitHub Stats */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-github-text">Your GitHub Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-github-gray">Repositories</span>
              <span className="text-sm font-medium">{currentUser.publicRepos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-github-gray">Followers</span>
              <span className="text-sm font-medium">{currentUser.followers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-github-gray">Following</span>
              <span className="text-sm font-medium">{currentUser.following}</span>
            </div>
            
            {currentUser.topLanguages && currentUser.topLanguages.length > 0 && (
              <div className="pt-3 border-t border-github-border">
                <p className="text-xs text-github-gray mb-2">Top Languages</p>
                <div className="flex flex-wrap gap-1">
                  {currentUser.topLanguages.map((language, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-github-text">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-github-text mb-2">Difficulty Level</label>
            <div className="space-y-2">
              {Object.entries(difficultyCounts).map(([difficulty, count]) => (
                <label key={difficulty} className="flex items-center">
                  <Checkbox
                    checked={selectedDifficulties.includes(difficulty)}
                    onCheckedChange={(checked) => handleDifficultyChange(difficulty, checked as boolean)}
                    className="rounded border-github-border text-github-blue focus:ring-github-blue"
                  />
                  <span className="ml-2 text-sm text-github-gray capitalize">{difficulty}</span>
                  <Badge 
                    variant={difficulty === 'beginner' ? 'default' : 'secondary'}
                    className="ml-auto text-xs"
                  >
                    {count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Programming Languages */}
          <div>
            <label className="block text-sm font-medium text-github-text mb-2">Languages</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableLanguages.slice(0, 8).map(({ name, count }) => (
                <label key={name} className="flex items-center">
                  <Checkbox
                    checked={selectedLanguages.includes(name)}
                    onCheckedChange={(checked) => handleLanguageChange(name, checked as boolean)}
                    className="rounded border-github-border text-github-blue focus:ring-github-blue"
                  />
                  <span className="ml-2 text-sm text-github-gray">{name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Repository Size */}
          <div>
            <label className="block text-sm font-medium text-github-text mb-2">Repository Size</label>
            <Select value={repositorySize} onValueChange={handleRepositorySizeChange}>
              <SelectTrigger className="w-full border-github-border bg-white focus:ring-github-blue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any size</SelectItem>
                <SelectItem value="small">Small (&lt; 100 stars)</SelectItem>
                <SelectItem value="medium">Medium (100-1k stars)</SelectItem>
                <SelectItem value="large">Large (1k+ stars)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={applyFilters}
            className="w-full bg-github-blue text-white hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
