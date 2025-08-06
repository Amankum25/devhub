import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { MessageCircle, UserPlus, Eye } from "lucide-react";

export default function UserCard({ user, onStartChat, onViewProfile, currentUser, compact = false }) {
  const getAvatarFallback = (user) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const isCurrentUser = currentUser?.id === user._id;

  if (compact) {
    return (
      <div className="flex items-center p-2 hover:bg-muted rounded-lg transition-colors">
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{getAvatarFallback(user)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        </div>
        {!isCurrentUser && onStartChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStartChat(user._id)}
            className="ml-2"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{getAvatarFallback(user)}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            {user.role && (
              <Badge variant="secondary" className="text-xs mt-1">
                {user.role}
              </Badge>
            )}
          </div>
        </div>
        
        {user.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {user.bio}
          </p>
        )}

        {!isCurrentUser && (
          <div className="flex space-x-2">
            {onStartChat && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onStartChat(user._id)}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
            )}
            {onViewProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(user._id)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Profile
              </Button>
            )}
          </div>
        )}
        
        {isCurrentUser && (
          <Badge variant="outline" className="w-full justify-center">
            This is you
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
