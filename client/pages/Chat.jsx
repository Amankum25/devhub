import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Send, Users, Hash, Settings, Search, Smile, Paperclip, MoreVertical } from 'lucide-react';

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({
    general: [
      { id: 1, user: 'Alice Johnson', avatar: '/placeholder.svg', message: 'Hey everyone! Working on a new React project, any tips for state management?', time: '10:30 AM', isOwn: false },
      { id: 2, user: 'Bob Smith', avatar: '/placeholder.svg', message: 'For React 18, I\'d recommend using Zustand or the built-in useReducer for complex state', time: '10:32 AM', isOwn: false },
      { id: 3, user: 'You', avatar: '/placeholder.svg', message: 'Thanks! I\'ll check out Zustand. Has anyone used it in production?', time: '10:35 AM', isOwn: true },
      { id: 4, user: 'Carol White', avatar: '/placeholder.svg', message: 'Yes! We\'ve been using Zustand for 6 months now. Much cleaner than Redux for our use case', time: '10:37 AM', isOwn: false },
      { id: 5, user: 'David Lee', avatar: '/placeholder.svg', message: 'Just remember to use devtools middleware for debugging. Makes development much easier!', time: '10:39 AM', isOwn: false }
    ],
    'react-help': [
      { id: 1, user: 'Emma Wilson', avatar: '/placeholder.svg', message: 'Can someone help me with React 18 concurrent features?', time: '9:15 AM', isOwn: false },
      { id: 2, user: 'Frank Miller', avatar: '/placeholder.svg', message: 'Sure! What specifically are you trying to implement?', time: '9:17 AM', isOwn: false },
      { id: 3, user: 'You', avatar: '/placeholder.svg', message: 'I\'m also interested in this. Are you using Suspense?', time: '9:20 AM', isOwn: true }
    ],
    'js-tips': [
      { id: 1, user: 'Grace Chen', avatar: '/placeholder.svg', message: 'Quick tip: Use optional chaining (?.) to avoid null reference errors', time: '8:45 AM', isOwn: false },
      { id: 2, user: 'Henry Davis', avatar: '/placeholder.svg', message: 'That saved me so many try-catch blocks! ES2020 features are amazing', time: '8:47 AM', isOwn: false }
    ]
  });
  
  const [onlineUsers] = useState([
    { name: 'Alice Johnson', status: 'online', avatar: '/placeholder.svg' },
    { name: 'Bob Smith', status: 'online', avatar: '/placeholder.svg' },
    { name: 'Carol White', status: 'away', avatar: '/placeholder.svg' },
    { name: 'David Lee', status: 'online', avatar: '/placeholder.svg' },
    { name: 'Emma Wilson', status: 'offline', avatar: '/placeholder.svg' },
    { name: 'Frank Miller', status: 'online', avatar: '/placeholder.svg' },
    { name: 'Grace Chen', status: 'away', avatar: '/placeholder.svg' },
    { name: 'Henry Davis', status: 'online', avatar: '/placeholder.svg' }
  ]);

  const [rooms] = useState([
    { id: 'general', name: 'General', type: 'public', members: 124, unread: 3 },
    { id: 'react-help', name: 'React Help', type: 'public', members: 89, unread: 1 },
    { id: 'js-tips', name: 'JavaScript Tips', type: 'public', members: 156, unread: 0 },
    { id: 'career-advice', name: 'Career Advice', type: 'public', members: 67, unread: 5 },
    { id: 'code-review', name: 'Code Review', type: 'public', members: 45, unread: 0 },
    { id: 'random', name: 'Random', type: 'public', members: 78, unread: 2 }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedRoom]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: 'You',
      avatar: '/placeholder.svg',
      message: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages(prev => ({
      ...prev,
      [selectedRoom]: [...(prev[selectedRoom] || []), newMessage]
    }));
    setMessage('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const currentRoom = rooms.find(room => room.id === selectedRoom);
  const currentMessages = messages[selectedRoom] || [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">DevHub Chat</h2>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search rooms or users..." 
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Channels</h3>
              <div className="space-y-1">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left text-sm transition-colors ${
                      selectedRoom === room.id 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Hash className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate font-medium">{room.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {room.unread > 0 && (
                        <Badge variant="secondary" className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                          {room.unread}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">{room.members}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Online Users */}
            <div className="p-3 border-t">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Online Users ({onlineUsers.filter(u => u.status === 'online').length})
              </h3>
              <div className="space-y-2">
                {onlineUsers.slice(0, 8).map((user, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                    </div>
                    <span className={`truncate ${user.status === 'online' ? 'text-gray-900' : 'text-gray-500'}`}>
                      {user.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Hash className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900">{currentRoom?.name}</h3>
                  <p className="text-sm text-gray-500">{currentRoom?.members} members</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-[70%] ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`space-y-1 ${msg.isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${msg.isOwn ? 'text-blue-600' : 'text-gray-900'}`}>
                          {msg.user}
                        </span>
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        msg.isOwn 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message #${currentRoom?.name}...`}
                    className="pr-20 min-h-[2.5rem] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={!message.trim()} className="h-10">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
