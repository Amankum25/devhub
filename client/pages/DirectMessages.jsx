import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import {
  Send,
  Search,
  MessageCircle,
  UserPlus,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Info
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function DirectMessages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/chat/direct-messages');
      if (response.data.success) {
        setConversations(response.data.data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      const response = await api.post(`/chat/rooms/${selectedConversation.id}/messages`, {
        message: message.trim(),
        type: 'text'
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data.message]);
        setMessage("");
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/chat/users/search?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSearchResults(response.data.data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startConversation = async (userId) => {
    try {
      const response = await api.post(`/chat/direct-messages/${userId}`);
      if (response.data.success) {
        const { roomId, participant } = response.data.data;
        
        // Create or update conversation in local state
        const newConversation = {
          id: roomId,
          participant,
          lastActivity: new Date().toISOString(),
          isOnline: false
        };

        setConversations(prev => {
          const existing = prev.find(c => c.id === roomId);
          if (existing) {
            return prev;
          }
          return [newConversation, ...prev];
        });

        setSelectedConversation(newConversation);
        await loadMessages(roomId);
        setShowNewChatDialog(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAvatarFallback = (user) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="pl-9"
                    />
                  </div>
                  
                  <ScrollArea className="h-64">
                    {isSearching ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center p-2 hover:bg-muted rounded-lg cursor-pointer"
                            onClick={() => startConversation(user._id)}
                          >
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{getAvatarFallback(user)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery.length >= 2 ? (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Type to search for users</p>
                    )}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground">Start a new chat to begin messaging</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.participant.avatar} />
                      <AvatarFallback>{getAvatarFallback(conversation.participant)}</AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 ml-3 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm truncate">
                        {conversation.participant.firstName} {conversation.participant.lastName}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastActivity)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      @{conversation.participant.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="mr-2 md:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={selectedConversation.participant.avatar} />
                  <AvatarFallback>{getAvatarFallback(selectedConversation.participant)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {selectedConversation.participant.firstName} {selectedConversation.participant.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.author._id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md`}>
                      {msg.author._id !== user?.id && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={msg.author.avatar} />
                          <AvatarFallback>{getAvatarFallback(msg.author)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          msg.author._id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!message.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
