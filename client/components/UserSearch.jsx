import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Search, MessageCircle, Users } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import UserCard from "./UserCard";
import { useNavigate } from "react-router-dom";

export default function UserSearch({ trigger = null, onStartChat = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchUsers = async (query) => {
    setIsSearching(true);
    try {
      const response = await api.get(`/chat/users/search?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSearchResults(response.data.data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await api.post(`/chat/direct-messages/${userId}`);
      if (response.data.success) {
        if (onStartChat) {
          onStartChat(response.data.data.roomId, response.data.data.participant);
        } else {
          // Navigate to chat page with the conversation
          navigate('/chat', { state: { activeTab: 'direct', conversationId: response.data.data.roomId } });
        }
        setIsOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <Users className="h-4 w-4" />
      Find Users
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Find Users to Chat With
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <ScrollArea className="h-80">
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    currentUser={currentUser}
                    onStartChat={handleStartChat}
                    onViewProfile={handleViewProfile}
                    compact={true}
                  />
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No users found</p>
                <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Search for users</p>
                <p className="text-sm text-muted-foreground">Type at least 2 characters to start searching</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
