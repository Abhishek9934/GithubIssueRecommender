import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, X, Github, Filter, Search, Star } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  target?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to GitHub Issue Recommender!",
      description: "Let's take a quick tour to help you find your perfect open source contributions.",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Github className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            This app helps you discover beginner-friendly GitHub issues that match your skills and interests. 
            We'll show you how to get started in just a few steps.
          </p>
        </div>
      )
    },
    {
      id: "connect-github",
      title: "Connect Your GitHub Profile",
      description: "Link your GitHub account to get personalized recommendations.",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Github className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            <div>
              <h4 className="font-medium">GitHub Integration</h4>
              <p className="text-sm text-muted-foreground">
                We analyze your repositories to understand your programming languages and experience level.
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 Tip: Click "Connect GitHub" in the header and enter your username to get started.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "browse-issues",
      title: "Browse Recommended Issues",
      description: "Discover issues tailored to your skills and interests.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Badge variant="secondary" className="bg-green-100 text-green-800">Beginner</Badge>
              <div>
                <p className="font-medium text-sm">Fix typo in documentation</p>
                <p className="text-xs text-muted-foreground">JavaScript • react/react</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Intermediate</Badge>
              <div>
                <p className="font-medium text-sm">Add new feature to CLI tool</p>
                <p className="text-xs text-muted-foreground">Python • microsoft/vscode</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Issues are curated from popular open source projects and categorized by difficulty level.
          </p>
        </div>
      )
    },
    {
      id: "use-filters",
      title: "Filter Issues",
      description: "Use the sidebar to find issues that match your preferences.",
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Filter className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Smart Filtering</h4>
              <p className="text-sm text-muted-foreground">
                Filter by programming language, difficulty level, and repository popularity.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Languages you know</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Difficulty level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Repository size</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "search-feature",
      title: "Search and Discover",
      description: "Use the search bar to find specific types of issues.",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Search className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-medium">Search Issues</h4>
              <p className="text-sm text-muted-foreground">
                Search by keywords, repository name, or issue title to find exactly what you're looking for.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🔍 Try searching for "documentation", "bug fix", or "first-time-contributor"
            </p>
          </div>
        </div>
      )
    },
    {
      id: "start-contributing",
      title: "Start Contributing!",
      description: "You're ready to make your first open source contribution.",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-green-50 dark:bg-green-950 rounded-lg">
            <Star className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Ready to contribute?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Click on any issue to view details on GitHub</li>
              <li>• Read the issue description and requirements</li>
              <li>• Fork the repository and start coding</li>
              <li>• Submit a pull request when you're done</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              🎉 Good luck with your open source journey!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{currentStepData.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {currentStepData.description}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          {currentStepData.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep 
                      ? "bg-blue-600" 
                      : index < currentStep 
                        ? "bg-blue-300" 
                        : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 0 && (
              <Button variant="outline" onClick={handleSkip}>
                Skip Tutorial
              </Button>
            )}
            
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding) {
      // Small delay to let the app load first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('hasCompletedOnboarding');
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    resetOnboarding
  };
}