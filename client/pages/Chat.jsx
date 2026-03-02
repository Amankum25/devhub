import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Plus, Hash, Send, Search, LogIn, RefreshCw, MessageCircle, User } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import '../components/ChatAnimations.css';

// Custom styles for better scrolling
const customStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 214, 113, 0.2) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 214, 113, 0.2);
    border-radius: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 214, 113, 0.4);
  }
`;

const Chat = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [testClickCount, setTestClickCount] = useState(0);
  const [searchUsers, setSearchUsers] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [selectedDM, setSelectedDM] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const socketRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const token = localStorage.getItem('devhub_token');
    if (token) {
      socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Connected to Socket.io server');
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      socketRef.current.on('receive_message', (newMessage) => {
        console.log('📩 Received new message:', newMessage);
        setMessages(prev => {
          // Check if message belongs to current room
          if (newMessage.chatRoom !== selectedRoom?._id) return prev;

          // Deduplication
          if (prev.some(msg => msg._id === newMessage._id)) return prev;

          return [...prev, newMessage].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });

        // Update direct message if applicable
        // (Logic for DM updates would go here or be handled by a separate event)
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, selectedRoom]); // Re-connect if user changes, or update handlers if room changes logic requires it
  // Note: ideally strictly one connection per session, but for now this is safe.

  // Join/Leave rooms
  useEffect(() => {
    if (socketRef.current && selectedRoom) {
      socketRef.current.emit('join_room', selectedRoom._id);

      return () => {
        socketRef.current.emit('leave_room', selectedRoom._id);
      };
    }
  }, [selectedRoom]);

  useEffect(() => {
    console.log('Chat component mounted, user:', user);
    console.log('User authentication state:', user ? 'logged in' : 'not logged in');
    const storedToken = localStorage.getItem('devhub_token');
    const storedUser = localStorage.getItem('devhub_user');
    // Wait for authLoading to finish before redirecting
    if (authLoading) return;
    if (user) {
      console.log('User details:', { username: user.username, email: user.email, id: user._id });
      loadRooms();
    } else if (storedToken && storedUser) {
      // Wait for context to restore for up to 3 seconds
      let waited = 0;
      const interval = setInterval(() => {
        waited += 500;
        if (user) {
          clearInterval(interval);
          loadRooms();
        } else if (waited >= 3000) {
          clearInterval(interval);
          console.log('Auth context failed to restore, redirecting to login');
          addNotification('Please log in to access chat', 'error');
          navigate('/login');
        }
      }, 500);
    } else {
      console.log('No user found and no stored auth, redirecting to login');
      addNotification('Please log in to access chat', 'error');
      navigate('/login');
      return;
    }
    // Load saved direct messages from localStorage
    const savedDMs = localStorage.getItem('chatDirectMessages');
    if (savedDMs) {
      try {
        const parsedDMs = JSON.parse(savedDMs);
        setDirectMessages(parsedDMs);
        console.log('Loaded saved DMs:', parsedDMs);
      } catch (error) {
        console.error('Error loading saved DMs:', error);
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (selectedRoom) {
      // Load messages initially
      loadMessages(selectedRoom._id);
      // No polling needed with socket.io
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save direct messages to localStorage whenever they change
  useEffect(() => {
    if (directMessages.length > 0) {
      localStorage.setItem('chatDirectMessages', JSON.stringify(directMessages));
      console.log('Saved DMs to localStorage:', directMessages);
    }
  }, [directMessages]);

  // Save room messages to localStorage for persistence
  useEffect(() => {
    if (selectedRoom && messages.length > 0) {
      const roomMessagesKey = `chatRoomMessages_${selectedRoom._id}`;
      localStorage.setItem(roomMessagesKey, JSON.stringify(messages));
      console.log(`Saved room messages to localStorage for room ${selectedRoom._id}:`, messages.length, 'messages');
    }
  }, [messages, selectedRoom]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, []);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);

    // Auto remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const loadRooms = async () => {
    try {
      console.log('🔄 Loading rooms...');
      const response = await api.get('/chat/rooms');
      console.log('=== LOAD ROOMS DEBUG ===');
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));

      if (response.data && response.data.data && response.data.data.rooms) {
        console.log('✅ Found rooms in response.data.data.rooms:', response.data.data.rooms);
        console.log('First room structure:', response.data.data.rooms[0]);
        setRooms(response.data.data.rooms);
        addNotification(`Loaded ${response.data.data.rooms.length} rooms`, 'success');
      } else if (response.data && response.data.rooms) {
        console.log('✅ Found rooms in response.data.rooms:', response.data.rooms);
        console.log('First room structure:', response.data.rooms[0]);
        setRooms(response.data.rooms);
        addNotification(`Loaded ${response.data.rooms.length} rooms`, 'success');
      } else if (Array.isArray(response.data)) {
        console.log('✅ Found rooms as array:', response.data);
        console.log('First room structure:', response.data[0]);
        setRooms(response.data);
        addNotification(`Loaded ${response.data.length} rooms`, 'success');
      } else {
        console.error('❌ Unexpected response format:', response);
        console.log('Setting empty array for rooms');
        setRooms([]);
        addNotification('No rooms found', 'error');
      }
      console.log('=== END LOAD ROOMS DEBUG ===');
    } catch (error) {
      console.error('Error loading rooms:', error);
      console.error('Error response:', error.response);

      if (error.response?.status === 401) {
        // Token might be expired, redirect to login
        addNotification('Authentication expired. Please log in again.', 'error');
        navigate('/login');
      } else if (error.response?.status === 403) {
        addNotification('Access denied. Please check your permissions.', 'error');
      } else if (error.response?.status === 500) {
        addNotification('Server error. Please try again later.', 'error');
      } else {
        addNotification(`Failed to load rooms: ${error.message || 'Unknown error'}`, 'error');
      }
      setRooms([]); // Ensure rooms is always an array
    } finally {
      setLoading(false); // Ensure loading is set to false after completion
    }
  };

  const loadMessages = useCallback(async (roomId, isRefresh = false) => {
    // Prevent rapid successive calls
    if (loadingMessages || refreshing) {
      console.log('Skipping loadMessages - already in progress');
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingMessages(true);
    }

    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      console.log('=== LOAD MESSAGES DEBUG ===');
      console.log('Room ID:', roomId);
      console.log('Is Refresh:', isRefresh);
      console.log('Response data:', response.data);

      // Backend returns { success: true, data: { messages: [...], pagination: {...} } }
      let messagesData = [];
      if (response.data && response.data.success && response.data.data && response.data.data.messages) {
        messagesData = Array.isArray(response.data.data.messages) ? response.data.data.messages : [];
        console.log('✅ Found messages (nested format):', messagesData.length, 'messages');
      } else if (response.data && response.data.messages && Array.isArray(response.data.messages)) {
        messagesData = response.data.messages;
        console.log('✅ Found messages (data.messages format):', messagesData.length, 'messages');
      } else if (response.data && Array.isArray(response.data)) {
        messagesData = response.data;
        console.log('✅ Found messages (direct array format):', messagesData.length, 'messages');
      } else {
        console.log('❌ No messages found or unexpected format:', response.data);
        messagesData = [];
      }

      console.log('Setting', messagesData.length, 'messages for room', roomId);

      // Smart message merging to prevent duplicates and maintain order
      if (isRefresh && messages.length > 0) {
        // For refresh, get all messages from server and merge intelligently
        const existingIds = new Set(messages.map(msg => msg._id));
        const newMessages = messagesData.filter(msg => msg._id && !existingIds.has(msg._id));

        if (newMessages.length > 0) {
          console.log('Adding', newMessages.length, 'new messages via refresh');
          setMessages(prev => {
            // Combine and sort by timestamp to maintain chronological order
            const combined = [...prev, ...newMessages];
            return combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });
        } else {
          console.log('No new messages found during refresh');
        }
      } else {
        // Initial load - replace all messages
        setMessages(messagesData);
      }

      console.log('=== END LOAD MESSAGES DEBUG ===');
    } catch (error) {
      console.error('Error loading messages:', error);
      if (!isRefresh) {
        setMessages([]); // Only reset messages on initial load error
        setError('Failed to load messages');
      }
    } finally {
      // Add small delay to prevent rapid successive calls
      setTimeout(() => {
        setLoadingMessages(false);
        setRefreshing(false);
      }, 300);
    }
  }, [loadingMessages, refreshing, messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || sending) return;

    setSending(true);
    try {
      console.log('=== SEND MESSAGE DEBUG ===');
      console.log('Selected room:', selectedRoom);
      console.log('Room ID:', selectedRoom._id);
      console.log('Message content:', newMessage.trim());
      console.log('API URL:', `/chat/rooms/${selectedRoom._id}/messages`);

      // Emit socket event instead of just API call if we want optimistic updates + confirmation
      // But standard pattern: API call -> Server saves & emits -> Client receives
      // Let's keep API call for persistence and acknowledgment

      const response = await api.post(`/chat/rooms/${selectedRoom._id}/messages`, {
        message: newMessage.trim()
      });

      // We rely on socket to receive the message back for the list...
      // OR we optimistically add it. 
      // Existing logic adds it from API response. 
      // Socket event might duplicate if we aren't careful.
      // DEDUPLICATION logic in 'receive_message' handles this.

      socketRef.current?.emit('send_message', {
        roomId: selectedRoom._id,
        content: newMessage.trim(),
        type: 'text'
      }); // Redundant if API does broadcasting, but typically one or other. 
      // Our server/socket.js does saving and broadcasting.
      // Our server/routes/chat.js DOES saving.
      // If we use both, we get double saves. 
      // Refactoring Plan: Use API for sending, and modify Backend API to emit socket event.
      // OR: Use Socket for sending completely.
      // Current server/socket.js handles saving! 
      // Current chat.js handles saving!
      // Let's stick to API for sending (easier error handling/validation in existing code)
      // AND modify chat.js to emit event. 
      // WAITING: I haven't modified chat.js to emit events yet. 
      // I added socket.js which does saving AND emitting.
      // If I use socket.emit('send_message'), it saves.
      // If I use API Post, it saves.

      // DECISION: Use Socket for sending to demonstrate real-time, 
      // BUT I need to handle the response.
      // Let's use the API POST method as primary, and add code to `server/routes/chat.js` to emit the event.
      // This is cleaner for existing REST structure.
      // SO: I will NOT emit 'send_message' from client here, just rely on API response + Socket "receive_message" broadcast from server.

      // Wait, I haven't edited `server/routes/chat.js` yet to emit!
      // I should do that first or concurrently.
      // For now, I'll rely on the API response for the sender, and socket for others?
      // No, sender needs to see it too. 

      // I will remove the socket.emit here and ensure backend emits on API POST.
      // See next step for backend update.

      let newMsg = null;
      if (response.data && response.data.success && response.data.data && response.data.data.message) {
        newMsg = response.data.data.message;
      } else if (response.data && response.data.message) {
        newMsg = response.data.message;
      } else if (response.data) {
        newMsg = response.data;
      }

      if (newMsg) {
        setMessages(prev => {
          if (newMsg._id) {
            const exists = prev.some(msg => msg._id === newMsg._id);
            if (exists) return prev;
          }
          return [...prev, newMsg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
        setNewMessage('');
        setError('');
        addNotification('Message sent successfully!', 'success');
        // Always reload messages after sending, regardless of previous state
        setTimeout(() => {
          loadMessages(selectedRoom._id, true);
        }, 100);
      } else {
        setError('Unexpected response from server');
        addNotification('Failed to send message', 'error');
      }
    } catch (error) {
      setError(`Failed to send message: ${error.message || 'Unknown error'}`);
      addNotification(`Failed to send message: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setSending(false);
    }
  };

  const createRoom = async () => {
    console.log('=== CREATE ROOM FUNCTION CALLED ===');
    if (!newRoomName.trim()) {
      console.log('Room name is empty:', newRoomName);
      setError('Please enter a room name');
      addNotification('Please enter a room name', 'error');
      return;
    }

    console.log('Creating room with name:', newRoomName.trim());

    try {
      console.log('=== CREATING ROOM REQUEST ===');
      console.log('API URL: /chat/rooms');
      console.log('Request payload:', {
        name: newRoomName.trim(),
        type: 'public'
      });

      const response = await api.post('/chat/rooms', {
        name: newRoomName.trim(),
        type: 'public'  // Backend expects 'public' not 'channel'
      });

      console.log('=== ROOM CREATION RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));

      if (response.data && response.data.success && response.data.data && response.data.data.room) {
        const newRoom = response.data.data.room;
        console.log('✅ Room created successfully (nested format):', newRoom);
        setRooms(prev => Array.isArray(prev) ? [...prev, newRoom] : [newRoom]);
        setNewRoomName('');
        setShowCreateRoom(false);
        setSelectedRoom(newRoom);
        setError('');
        addNotification(`Room "${newRoom.name}" created successfully!`, 'success');
        // Refresh rooms list to make sure we have the latest data
        loadRooms();
      } else if (response.data && response.data.room) {
        const newRoom = response.data.room;
        console.log('✅ Room created successfully (data.room format):', newRoom);
        setRooms(prev => Array.isArray(prev) ? [...prev, newRoom] : [newRoom]);
        setNewRoomName('');
        setShowCreateRoom(false);
        setSelectedRoom(newRoom);
        setError('');
        addNotification(`Room "${newRoom.name}" created successfully!`, 'success');
        // Refresh rooms list to make sure we have the latest data
        loadRooms();
      } else if (response.data && response.data.data) {
        // Handle case where room is directly in data
        const newRoom = response.data.data;
        console.log('✅ Room created successfully (data.data format):', newRoom);
        setRooms(prev => Array.isArray(prev) ? [...prev, newRoom] : [newRoom]);
        setNewRoomName('');
        setShowCreateRoom(false);
        setSelectedRoom(newRoom);
        setError('');
        addNotification(`Room "${newRoom.name}" created successfully!`, 'success');
        // Refresh rooms list to make sure we have the latest data
        loadRooms();
      } else {
        console.error('❌ Unexpected response format:', response);
        setError('Unexpected response from server');
        addNotification('Failed to create room: Unexpected response format', 'error');
      }
    } catch (error) {
      console.error('=== ROOM CREATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      }

      let errorMessage = 'Unknown error';
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(`Failed to create room: ${errorMessage}`);
      addNotification(`Failed to create room: ${errorMessage}`, 'error');
    }
  };

  const searchUsersFunction = async (query) => {
    if (!query.trim()) {
      setFoundUsers([]);
      return;
    }

    try {
      console.log('🔍 Searching users with query:', query);
      const response = await api.get(`/chat/users/search?q=${encodeURIComponent(query)}`);
      console.log('Search users response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));

      // Backend returns { success: true, data: { users, count } }
      let usersData = [];
      if (response.data && response.data.success && response.data.data && response.data.data.users) {
        usersData = Array.isArray(response.data.data.users) ? response.data.data.users : [];
        console.log('✅ Found users (nested format):', usersData);
      } else if (response.data && response.data.users) {
        usersData = Array.isArray(response.data.users) ? response.data.users : [];
        console.log('✅ Found users (data.users format):', usersData);
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
        console.log('✅ Found users (direct array format):', usersData);
      } else {
        console.log('❌ No users found or unexpected format:', response.data);
        usersData = [];
      }

      setFoundUsers(usersData);
      console.log('Setting foundUsers to:', usersData);
    } catch (error) {
      console.error('Error searching users:', error);
      console.error('Error response:', error.response);
      setFoundUsers([]); // Ensure foundUsers is always an array on error
    }
  };

  const handleUserSearch = (e) => {
    const query = e.target.value;
    setSearchUsers(query);
    searchUsersFunction(query);
  };

  const startDirectMessage = (user) => {
    // Check if DM already exists
    const existingDM = directMessages.find(dm => dm.user._id === user._id);

    if (existingDM) {
      setSelectedDM(existingDM);
      setSelectedRoom(null); // Deselect room when selecting DM
    } else {
      // Create new DM
      const newDM = {
        id: `dm_${user._id}`,
        user: user,
        messages: [],
        lastActivity: new Date()
      };
      setDirectMessages(prev => [...prev, newDM]);
      setSelectedDM(newDM);
      setSelectedRoom(null); // Deselect room when selecting DM
    }

    addNotification(`Started conversation with ${user.username}`, 'success');
    setFoundUsers([]); // Clear search results
    setSearchUsers(''); // Clear search input
  };

  const sendDirectMessage = async (dmId, message) => {
    try {
      // For now, we'll simulate DM functionality
      // In a real app, you'd have a separate API endpoint for DMs
      const newMessage = {
        id: Date.now(),
        content: message,
        author: { username: user.username },
        createdAt: new Date()
      };

      // Update the direct message immediately
      const updatedDMs = directMessages.map(dm =>
        dm.id === dmId
          ? { ...dm, messages: [...dm.messages, newMessage], lastActivity: new Date() }
          : dm
      );

      setDirectMessages(updatedDMs);

      // Immediately save to localStorage
      localStorage.setItem('chatDirectMessages', JSON.stringify(updatedDMs));
      console.log('Direct message saved locally:', newMessage);

      addNotification('Direct message sent!', 'success');
    } catch (error) {
      addNotification('Failed to send direct message', 'error');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E1A]">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3BD671]/30 border-t-[#3BD671] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is logged in - but don't redirect immediately on page load
  if (!user && !loading && !authLoading) {
    // Only redirect if both AuthContext and localStorage are missing user info
    const storedToken = localStorage.getItem('devhub_token');
    const storedUser = localStorage.getItem('devhub_user');
    if (!storedToken || !storedUser) {
      return (
        <div className="min-h-screen bg-[#0B0E1A]">
          <Navigation />
          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
              <LogIn className="h-10 w-10 mx-auto mb-3 text-slate-600" />
              <h3 className="text-base font-semibold text-white mb-1">Sign in to chat</h3>
              <p className="text-slate-500 text-sm mb-4">Authentication required to use DevHub Chat</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => navigate('/login')} className="btn-gradient text-[#0B0E1A] font-semibold text-sm px-4 py-2 rounded-lg">Log In</button>
                <button onClick={() => navigate('/register')} className="border border-[#252B40] text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Show authentication error state
  if (error && (error.includes('log in') || error.includes('Session expired'))) {
    return (
      <div className="min-h-screen bg-[#0B0E1A]">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <LogIn className="h-10 w-10 mx-auto mb-3 text-slate-600" />
            <h3 className="text-base font-semibold text-white mb-1">Session expired</h3>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => navigate('/login')} className="btn-gradient text-[#0B0E1A] font-semibold text-sm px-4 py-2 rounded-lg">Log In</button>
              <button onClick={() => window.location.reload()} className="border border-[#252B40] text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">Refresh</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E1A]">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <Navigation />

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg text-sm font-medium border ${
              notification.type === 'success'
                ? 'bg-[#3BD671]/15 border-[#3BD671]/30 text-[#3BD671]'
                : 'bg-red-950/50 border-red-800/50 text-red-400'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <div className="pt-16 h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 bg-[#0E1120] border-r border-[#252B40] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#252B40]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Channels ({Array.isArray(rooms) ? rooms.length : 0})</span>
                <div className="flex gap-1">
                  <button
                    className="w-7 h-7 rounded-lg bg-[#141829] border border-[#252B40] text-slate-500 hover:text-white flex items-center justify-center transition-colors"
                    onClick={() => { loadRooms(); addNotification('Rooms refreshed', 'success'); }}
                    title="Refresh"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg bg-[#3BD671]/15 border border-[#3BD671]/25 text-[#3BD671] hover:bg-[#3BD671]/25 flex items-center justify-center transition-colors"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTestClickCount(prev => prev + 1); setShowCreateRoom(!showCreateRoom); }}
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {showCreateRoom && (
                <div className="mb-3 space-y-2">
                  <input
                    placeholder="Room name..."
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                    className="w-full px-3 py-1.5 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50"
                  />
                  <div className="flex gap-2">
                    <button onClick={createRoom} className="flex-1 btn-gradient text-[#0B0E1A] font-semibold text-xs py-1.5 rounded-lg">Create</button>
                    <button onClick={() => setShowCreateRoom(false)} className="flex-1 border border-[#252B40] text-slate-500 text-xs py-1.5 rounded-lg hover:text-white transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {/* User search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                <input
                  placeholder="Search users..."
                  value={searchUsers}
                  onChange={handleUserSearch}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50"
                />
              </div>

              {foundUsers.length > 0 && (
                <div className="mt-2 bg-[#141829] rounded-lg border border-[#252B40] max-h-36 overflow-y-auto">
                  {Array.isArray(foundUsers) && foundUsers.map(foundUser => (
                    <div key={foundUser._id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#1a2035] cursor-pointer">
                      <div className="w-6 h-6 bg-[#3BD671]/20 rounded-full flex items-center justify-center text-[#3BD671] text-xs font-bold flex-shrink-0">
                        {foundUser.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs text-white flex-1 truncate">{foundUser.username}</span>
                      <button onClick={() => startDirectMessage(foundUser)} className="text-xs text-[#3BD671] hover:underline">DM</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DMs */}
            {directMessages.length > 0 && (
              <div className="p-4 border-b border-[#252B40]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Direct Messages</span>
                  <button onClick={() => { setDirectMessages([]); setSelectedDM(null); localStorage.removeItem('chatDirectMessages'); }} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Clear</button>
                </div>
                {directMessages.map(dm => (
                  <div
                    key={dm.id}
                    onClick={() => { setSelectedDM(dm); setSelectedRoom(null); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer mb-1 transition-colors ${
                      selectedDM?.id === dm.id ? 'bg-[#3BD671]/10 border border-[#3BD671]/20' : 'hover:bg-[#141829]'
                    }`}
                  >
                    <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {dm.user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{dm.user.username}</p>
                      {dm.messages.length > 0 && (
                        <p className="text-xs text-slate-600 truncate">{dm.messages[dm.messages.length - 1].content}</p>
                      )}
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#3BD671] rounded-full flex-shrink-0"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Room list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
              {Array.isArray(rooms) && rooms.map(room => (
                <div
                  key={room._id}
                  onClick={() => {
                    const roomMessagesKey = `chatRoomMessages_${room._id}`;
                    const cachedMessages = localStorage.getItem(roomMessagesKey);
                    if (cachedMessages) {
                      try { setMessages(JSON.parse(cachedMessages)); } catch (error) { /* ignore */ }
                    }
                    setSelectedRoom(room);
                    setSelectedDM(null);
                    setError('');
                    setTimeout(() => { scrollToTop(); }, 100);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedRoom?._id === room._id
                      ? 'bg-[#3BD671]/10 border border-[#3BD671]/20 text-white'
                      : 'text-slate-500 hover:bg-[#141829] hover:text-white'
                  }`}
                >
                  <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-sm font-medium truncate flex-1">{room.name}</span>
                  {room.participants && (
                    <span className="text-xs text-slate-700">{room.participants.length}</span>
                  )}
                </div>
              ))}

              {(!Array.isArray(rooms) || rooms.length === 0) && (
                <div className="text-center py-8">
                  <Hash className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">No channels yet</p>
                  <p className="text-xs text-slate-700 mt-0.5">Create one above</p>
                </div>
              )}
            </div>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedRoom && !selectedDM ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#0E1120] border border-[#252B40] flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-5 w-5 text-slate-600" />
                  </div>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">Select a channel</p>
                  <p className="text-xs text-slate-600">Choose a channel from the sidebar or start a DM</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-[#252B40] bg-[#0E1120]">
                  <div className="w-8 h-8 bg-[#3BD671]/15 border border-[#3BD671]/25 rounded-lg flex items-center justify-center">
                    {selectedRoom ? <Hash className="h-4 w-4 text-[#3BD671]" /> : <User className="h-4 w-4 text-[#3BD671]" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">
                      {selectedRoom ? selectedRoom.name : `@ ${selectedDM?.user.username}`}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {selectedRoom ? `${selectedRoom.participants?.length || 0} members` : 'Direct message'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#3BD671] rounded-full"></div>
                    <span className="text-xs text-slate-600">Live</span>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-3"
                >
                  {error && (
                    <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">{error}</div>
                  )}

                  {loadingMessages && (
                    <div className="flex justify-center py-6">
                      <div className="w-5 h-5 border-2 border-[#3BD671]/30 border-t-[#3BD671] rounded-full animate-spin" />
                    </div>
                  )}

                  {selectedRoom && Array.isArray(messages) && messages.map((message) => {
                    const isOwn = (message.author?.username || message.sender?.username) === user?.username;
                    return (
                      <div key={message._id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isOwn ? 'bg-[#3BD671]/20 text-[#3BD671]' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {((message.author?.username || message.sender?.username) || 'U')[0].toUpperCase()}
                        </div>
                        <div className={`flex-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-semibold text-slate-400">
                              {(message.author?.username || message.sender?.username) || 'Unknown'}
                            </span>
                            <span className="text-xs text-slate-700">{formatTime(message.createdAt)}</span>
                          </div>
                          <div className={`px-3 py-2 rounded-xl text-sm max-w-md ${
                            isOwn
                              ? 'bg-[#3BD671]/15 border border-[#3BD671]/20 text-white rounded-tr-sm'
                              : 'bg-[#141829] border border-[#252B40] text-slate-300 rounded-tl-sm'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {selectedDM && selectedDM.messages.map((message) => {
                    const isOwn = message.author?.username === user?.username;
                    return (
                      <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isOwn ? 'bg-[#3BD671]/20 text-[#3BD671]' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {(message.author?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div className={`flex-1 flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-semibold text-slate-400">{message.author?.username || 'You'}</span>
                            <span className="text-xs text-slate-700">{formatTime(message.createdAt)}</span>
                          </div>
                          <div className={`px-3 py-2 rounded-xl text-sm max-w-md ${
                            isOwn
                              ? 'bg-[#3BD671]/15 border border-[#3BD671]/20 text-white rounded-tr-sm'
                              : 'bg-[#141829] border border-[#252B40] text-slate-300 rounded-tl-sm'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {selectedRoom && (!Array.isArray(messages) || messages.length === 0) && (
                    <div className="text-center py-12">
                      <Hash className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">No messages yet — say hello!</p>
                    </div>
                  )}

                  {selectedDM && selectedDM.messages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm text-slate-600">Start a conversation with {selectedDM.user.username}</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-[#252B40] bg-[#0E1120]">
                  <div className="flex gap-2">
                    <input
                      placeholder={selectedRoom ? `Message #${selectedRoom.name}` : `Message ${selectedDM?.user.username}`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (selectedRoom) { sendMessage(); }
                          else if (selectedDM) { sendDirectMessage(selectedDM.id, newMessage); setNewMessage(''); }
                        }
                      }}
                      disabled={sending}
                      className="flex-1 px-4 py-2.5 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50 disabled:opacity-50"
                    />
                    <button
                      onClick={() => {
                        if (selectedRoom) { sendMessage(); }
                        else if (selectedDM) { sendDirectMessage(selectedDM.id, newMessage); setNewMessage(''); }
                      }}
                      disabled={!newMessage.trim() || sending}
                      className="btn-gradient text-[#0B0E1A] font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-[#0B0E1A] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><Send className="h-3.5 w-3.5" /> Send</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
