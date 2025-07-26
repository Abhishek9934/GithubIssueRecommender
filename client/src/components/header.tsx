import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Search, Github, ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface HeaderProps {
  currentUser?: User;
  onSearch: (query: string) => void;
  onDisconnectGitHub?: () => void;
}

export function Header({ currentUser, onSearch, onDisconnectGitHub }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <>
      <header className="bg-white border-b border-github-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Github className="text-2xl text-github-text" />
                <h1 className="text-xl font-semibold text-github-text">Issue Recommender</h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-github-gray" />
                </div>
                <Input
                  type="text"
                  placeholder="Search repositories, languages, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-github-border rounded-md bg-github-bg focus:outline-none focus:ring-2 focus:ring-github-blue focus:border-transparent"
                />
              </form>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 text-github-gray hover:text-github-text"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2 text-github-gray hover:text-github-text">
                <Bell className="h-4 w-4" />
              </Button>
              
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-github-bg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.avatarUrl || ""} alt="User profile" />
                        <AvatarFallback>{currentUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium text-github-text">
                        {currentUser.username}
                      </span>
                      <ChevronDown className="h-3 w-3 text-github-gray" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">Signed in as</p>
                      <p className="text-sm text-muted-foreground">{currentUser.username}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onDisconnectGitHub}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Disconnect GitHub</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>G</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-github-text">
                    Guest
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white h-full">
            <div className="p-4 border-b border-github-border">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-github-gray"
                  onClick={() => setShowMobileSearch(false)}
                >
                  ×
                </Button>
                <form onSubmit={handleSearch} className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search repositories, languages, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-github-border rounded-md bg-github-bg focus:outline-none focus:ring-2 focus:ring-github-blue focus:border-transparent"
                    autoFocus
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
