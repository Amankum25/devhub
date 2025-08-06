import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Send,
  Users,
  Hash,
  Settings,
  Search,
  Smile,
  Paperclip,
  MoreVertical,
  MessageCircle,
  UserPlus,
  Plus,
  RefreshCw,
} from "lucide-react";
import DirectMessages from "./DirectMessages";
import UserSearch from "../components/UserSearch";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from 'react-toastify';

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("channels");
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useAuth();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat rooms
  const loadRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      if (response.data.success) {
        setRooms(response.data.data.rooms);
        // Auto-select first room if none selected
        if (!selectedRoom && response.data.data.rooms.length > 0) {
          setSelectedRoom(response.data.data.rooms[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast.error('Failed to load chat rooms');
    }
  };

  // Load messages for selected room
  const loadMessages = async (roomId) => {
    if (!roomId) return;
    
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !selectedRoom || isSending) return;

    setIsSending(true);
    try {
      const response = await api.post(`/chat/rooms/${selectedRoom}/messages`, {
        content: message.trim()
      });

      if (response.data.success) {
        setMessage("");
        // Add new message to the list
        const newMessage = response.data.data.message;
        setMessages(prev => [...prev, newMessage]);
        toast.success('Message sent!');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Create new room
  const createRoom = async () => {
    const roomName = prompt('Enter room name:');
    if (!roomName?.trim()) return;

    try {
      const response = await api.post('/chat/rooms', {
        name: roomName.trim(),
        type: 'public'
      });

      if (response.data.success) {
        toast.success('Room created successfully!');
        loadRooms(); // Reload rooms
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room');
    }
  };

  // Handle room selection
  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
    loadMessages(roomId);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await loadRooms();
      setIsLoading(false);
    };

    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser]);

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
    }
  }, [selectedRoom]);

  const getSelectedRoomInfo = () => {
    return rooms.find(room => room._id === selectedRoom);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserInitials = (user) => {
    if (!user) return 'U';
    const firstName = user.firstName || user.name || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to access the chat
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        
        {/* Tabs for Mobile/Desktop */}
        <div className="lg:col-span-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="direct" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Direct Messages
              </TabsTrigger>
            </TabsList>

            {/* Channels Tab */}
            <TabsContent value="channels" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100%-3rem)]">
              
              {/* Left Sidebar - Rooms List */}
              <Card className="lg:col-span-3 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Channels
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={createRoom}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : rooms.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No channels found</p>
                        <Button size="sm" variant="outline" onClick={createRoom} className="mt-2">
                          Create First Channel
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {rooms.map((room) => (
                          <div
                            key={room._id}
                            onClick={() => handleRoomSelect(room._id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                              selectedRoom === room._id ? 'bg-accent' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{room.name}</span>
                              </div>
                              {room.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                                  {room.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {room.memberCount || 0} members
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Main Chat Area */}
              <Card className="lg:col-span-6 flex flex-col">
                {selectedRoom ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          <CardTitle className="text-lg">
                            {getSelectedRoomInfo()?.name || 'Channel'}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedRoomInfo()?.description || `Welcome to ${getSelectedRoomInfo()?.name}`}
                      </p>
                    </CardHeader>

                    {/* Messages Area */}
                    <CardContent className="flex-1 p-0">
                      <ScrollArea className="h-full p-4">
                        {messages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No messages yet</p>
                            <p className="text-sm">Be the first to start the conversation!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((msg) => (
                              <div
                                key={msg._id}
                                className={`flex gap-3 ${
                                  msg.sender._id === currentUser.id ? 'flex-row-reverse' : ''
                                }`}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={msg.sender.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {getUserInitials(msg.sender)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`flex-1 max-w-[70%] ${
                                  msg.sender._id === currentUser.id ? 'text-right' : ''
                                }`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">
                                      {msg.sender._id === currentUser.id 
                                        ? 'You' 
                                        : `${msg.sender.firstName} ${msg.sender.lastName}`
                                      }
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(msg.createdAt)}
                                    </span>
                                  </div>
                                  <div className={`p-3 rounded-lg ${
                                    msg.sender._id === currentUser.id
                                      ? 'bg-primary text-primary-foreground ml-auto'
                                      : 'bg-muted'
                                  }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder={`Message ${getSelectedRoomInfo()?.name || 'channel'}...`}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                          disabled={isSending}
                        />
                        <Button size="sm" variant="ghost">
                          <Smile className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={sendMessage} 
                          disabled={!message.trim() || isSending}
                        >
                          {isSending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Hash className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Select a channel to start chatting</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Right Sidebar - Online Users */}
              <Card className="lg:col-span-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Online ({onlineUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-2 p-2">
                      {onlineUsers.map((user, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-xs">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                                user.status === 'online'
                                  ? 'bg-green-500'
                                  : user.status === 'away'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {user.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Direct Messages Tab */}
            <TabsContent value="direct" className="h-[calc(100%-3rem)]">
              <DirectMessages />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
