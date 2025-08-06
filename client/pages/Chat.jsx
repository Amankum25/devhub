import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Plus, Hash, Send, Users, Search, Settings, LogIn, RefreshCw, MessageCircle, User } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import '../components/ChatAnimations.css';

// Custom styles for better scrolling
const customStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(59, 130, 246, 0.1);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
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

  // Auto-refresh and immediate load for direct messages
  useEffect(() => {
    if (selectedDM) {
      // Always load DM messages immediately when a DM is selected
      const savedDMs = localStorage.getItem('chatDirectMessages');
      if (savedDMs) {
        try {
          const parsedDMs = JSON.parse(savedDMs);
          const currentDM = parsedDMs.find(dm => dm.id === selectedDM.id);
          if (currentDM && currentDM.messages.length !== selectedDM.messages.length) {
            setSelectedDM(currentDM);
          }
        } catch (error) {
          console.error('Error loading saved DMs for DM refresh:', error);
        }
      }
      // Set up auto-refresh for DMs every 10 seconds (reduced frequency)
      const interval = setInterval(() => {
        const savedDMs = localStorage.getItem('chatDirectMessages');
        if (savedDMs) {
          try {
            const parsedDMs = JSON.parse(savedDMs);
            const currentDM = parsedDMs.find(dm => dm.id === selectedDM.id);
            if (currentDM && currentDM.messages.length !== selectedDM.messages.length) {
              setSelectedDM(currentDM);
            }
          } catch (error) {
            console.error('Error loading saved DMs for DM auto-refresh:', error);
          }
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedDM?.id]); // Only depend on the DM ID, not the entire object

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
      // Always load messages immediately when a room is selected
      loadMessages(selectedRoom._id);

      // Set up auto-refresh for messages every 10 seconds (reduced frequency)
      const interval = setInterval(() => {
        // Only block if a message load is already in progress
        if (!loadingMessages && !refreshing) {
          loadMessages(selectedRoom._id, true);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [selectedRoom]); // Remove loading states from dependencies to prevent infinite loop

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

      const response = await api.post(`/chat/rooms/${selectedRoom._id}/messages`, {
        message: newMessage.trim()
      });

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-purple-300/30 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-300 font-medium">Loading chat...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center max-w-md">
                <LogIn className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Authentication Required
                </h3>
                <p className="text-slate-300 mb-4">
                  Please log in to access the chat feature
                </p>
                <Button onClick={() => navigate('/login')} className="mr-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Log In
                </Button>
                <Button variant="outline" onClick={() => navigate('/register')} className="border-slate-600 text-slate-300 hover:bg-slate-800/50">
                  Sign Up
                </Button>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center max-w-md">
              <LogIn className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                Authentication Required
              </h3>
              <p className="text-slate-300 mb-4">
                {error}
              </p>
              <Button onClick={() => navigate('/login')} className="mr-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Log In
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="border-slate-600 text-slate-300 hover:bg-slate-800/50">
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Navigation />
      
      {/* Enhanced Notifications with animations */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-xl shadow-2xl transition-all duration-500 transform animate-slide-in-right backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-300/30' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white border border-red-300/30'
            } hover:scale-105`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-sm">✓</span>
                </div>
              ) : (
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-sm">✕</span>
                </div>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-4 max-w-full h-screen">
        <div className="flex gap-8 h-[calc(100vh-100px)]">
          {/* Enhanced Sidebar with glass morphism effect */}
          <div className="w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 animate-fade-in-left flex flex-col h-full">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Channels ({Array.isArray(rooms) ? rooms.length : 0})
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-110 hover:rotate-180"
                    onClick={() => {
                      loadRooms();
                      addNotification('Rooms refreshed', 'success');
                    }}
                    title="Refresh rooms"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <div style={{ position: 'relative', zIndex: 999 }}>
                    <button 
                      className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30 cursor-pointer shadow-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔥 BUTTON CLICKED! Count:', testClickCount + 1);
                        setTestClickCount(prev => prev + 1);
                        console.log('+ button clicked, current showCreateRoom:', showCreateRoom);
                        setShowCreateRoom(!showCreateRoom);
                        console.log('+ button clicked, new showCreateRoom:', !showCreateRoom);
                      }}
                      type="button"
                      style={{ position: 'relative', zIndex: 1000 }}
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>

              {showCreateRoom && (
                <div className="mb-6 space-y-3 animate-fade-in">
                  <div className="relative">
                    <Input
                      placeholder="Enter room name..."
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                      className="bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200/50 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-xl pointer-events-none"></div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      onClick={createRoom}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      ✨ Create
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowCreateRoom(false)}
                      className="border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-2 transition-all duration-300 transform hover:scale-105"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Enhanced User Search */}
              <div className="mb-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-blue-500" />
                  <Input
                    placeholder="Search users..."
                    value={searchUsers}
                    onChange={handleUserSearch}
                    className="pl-12 bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200/50 rounded-xl py-3 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-xl pointer-events-none"></div>
                </div>
                
                {foundUsers.length > 0 && (
                  <div className="mt-3 bg-gradient-to-r from-white to-blue-50 rounded-xl p-3 max-h-40 overflow-y-auto border border-blue-200/30 shadow-lg animate-fade-in">
                    {Array.isArray(foundUsers) && foundUsers.map(foundUser => (
                      <div key={foundUser._id} className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {foundUser.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-800">{foundUser.username}</span>
                          <span className="text-xs text-gray-500 ml-2">({foundUser.email})</span>
                        </div>
                        <button
                          onClick={() => startDirectMessage(foundUser)}
                          className="ml-auto text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-xs px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
                        >
                          💬 Message
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Direct Messages Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    💬 Direct Messages
                  </h3>
                  {directMessages.length > 0 && (
                    <button
                      onClick={() => {
                        setDirectMessages([]);
                        setSelectedDM(null);
                        localStorage.removeItem('chatDirectMessages');
                        addNotification('Direct messages cleared', 'success');
                      }}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors duration-300 hover:scale-110 transform"
                    >
                      🗑️ Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {directMessages.map(dm => (
                    <div 
                      key={dm.id}
                      onClick={() => {
                        setSelectedDM(dm);
                        setSelectedRoom(null);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        selectedDM?.id === dm.id 
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-300 shadow-lg' 
                          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 border border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {dm.user.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold">{dm.user.username}</span>
                        {dm.messages.length > 0 && (
                          <p className="text-xs text-gray-500 truncate">
                            {dm.messages[dm.messages.length - 1].content}
                          </p>
                        )}
                      </div>
                      <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  ))}
                  
                  {directMessages.length === 0 && (
                    <div className="text-center py-6 px-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-purple-200/30">
                      <div className="text-4xl mb-2">💭</div>
                      <p className="text-xs text-gray-500">
                        Search for users above to start a conversation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Room List */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50 rounded-b-2xl" style={{ minHeight: '300px', maxHeight: 'calc(100vh - 400px)' }}>
              {Array.isArray(rooms) && rooms.map(room => (
                <div
                  key={room._id}
                  onClick={() => {
                    console.log('Selecting room:', room);
                    
                    // Load cached messages immediately for better UX
                    const roomMessagesKey = `chatRoomMessages_${room._id}`;
                    const cachedMessages = localStorage.getItem(roomMessagesKey);
                    if (cachedMessages) {
                      try {
                        const parsedMessages = JSON.parse(cachedMessages);
                        setMessages(parsedMessages);
                        console.log('Loaded cached messages for room:', room.name, parsedMessages.length, 'messages');
                      } catch (error) {
                        console.error('Error loading cached messages:', error);
                      }
                    }
                    
                    setSelectedRoom(room);
                    setSelectedDM(null); // Clear DM selection
                    setError(''); // Clear any errors
                    
                    // Scroll to top when selecting a new room
                    setTimeout(() => {
                      scrollToTop();
                    }, 100);
                  }}
                  className={`flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedRoom?._id === room._id 
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-2 border-blue-300 shadow-xl backdrop-blur-sm' 
                      : 'bg-white/80 hover:bg-gradient-to-r hover:from-white hover:to-blue-50 border border-gray-200/50 shadow-lg hover:shadow-xl backdrop-blur-sm'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Hash className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-800 text-lg">{room.name}</span>
                    <div className="text-sm text-gray-500 mt-1">Click to join conversation</div>
                  </div>
                  {room.participants && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full shadow-md">
                      👥 {room.participants.length}
                    </Badge>
                  )}
                </div>
              ))}
              
              {(!Array.isArray(rooms) || rooms.length === 0) && (
                <div className="text-center py-8 px-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-200/30">
                  <div className="text-6xl mb-4">🏠</div>
                  <p className="text-gray-500 font-medium">No rooms available</p>
                  <p className="text-sm text-gray-400 mt-2">Create your first room above!</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 animate-fade-in-right h-full">
            {!selectedRoom && !selectedDM ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-6 p-8">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-20"></div>
                    <div className="absolute inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-2xl">
                      <MessageCircle className="h-10 w-10 text-white animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome to DevHub Chat
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      ✨ Select a room from the sidebar or start a direct message to begin your conversation journey
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Chat Header */}
                <div className="border-b border-blue-200/50 bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-md p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                      {selectedRoom ? (
                        <Hash className="h-6 w-6 text-white" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl bg-gradient-to-r from-gray-800 to-blue-700 bg-clip-text text-transparent">
                        {selectedRoom ? selectedRoom.name : `Chat with ${selectedDM?.user.username}`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedRoom 
                          ? `${selectedRoom.participants?.length || 0} members • Room chat`
                          : 'Direct message • Private conversation'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">Auto-sync enabled</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100/50 rounded-xl transition-all duration-300 transform hover:scale-105">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Messages Area */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-blue-50/20 custom-scrollbar" 
                  style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}
                >
                  {error && (
                    <Alert className="mb-4 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 animate-shake">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {loadingMessages && (
                    <div className="flex justify-center py-8">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {selectedRoom && Array.isArray(messages) && messages.map((message, index) => (
                      <div 
                        key={message._id} 
                        className={`flex gap-4 group hover:bg-white/30 hover:backdrop-blur-md p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in ${
                          (message.author?.username || message.sender?.username) === user?.username ? 'flex-row-reverse' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                          (message.author?.username || message.sender?.username) === user?.username 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                            : 'bg-gradient-to-r from-green-500 to-teal-500'
                        }`}>
                          {((message.author?.username || message.sender?.username) || 'U')[0].toUpperCase()}
                        </div>
                        <div className={`flex-1 ${(message.author?.username || message.sender?.username) === user?.username ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">
                              {(message.author?.username || message.sender?.username) || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <div className={`inline-block p-3 rounded-xl shadow-md max-w-lg backdrop-blur-sm ${
                            (message.author?.username || message.sender?.username) === user?.username
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                              : 'bg-white/90 border border-blue-200/30 text-gray-800 rounded-bl-md'
                          }`}>
                            <p className="leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {selectedDM && selectedDM.messages.map((message, index) => (
                      <div 
                        key={message.id} 
                        className={`flex gap-4 group hover:bg-white/30 hover:backdrop-blur-md p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in ${
                          message.author?.username === user?.username ? 'flex-row-reverse' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                          message.author?.username === user?.username 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}>
                          {(message.author?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div className={`flex-1 ${message.author?.username === user?.username ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">
                              {message.author?.username || 'You'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <div className={`inline-block p-3 rounded-xl shadow-md max-w-lg backdrop-blur-sm ${
                            message.author?.username === user?.username
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                              : 'bg-white/90 border border-purple-200/30 text-gray-800 rounded-bl-md'
                          }`}>
                            <p className="leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {selectedRoom && (!Array.isArray(messages) || messages.length === 0) && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">💬</div>
                        <p className="text-gray-500 font-medium">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-2">Be the first to start the conversation!</p>
                      </div>
                    )}
                    
                    {selectedDM && selectedDM.messages.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-xl">
                          {selectedDM.user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <p className="text-gray-500 font-medium">Start your conversation with {selectedDM.user.username}!</p>
                        <p className="text-sm text-gray-400 mt-2">Send the first message to break the ice! 🧊</p>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Message Input */}
                <div className="border-t border-blue-200/50 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-md p-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Input
                        placeholder={selectedRoom ? `Message #${selectedRoom.name}...` : `Message ${selectedDM?.user.username}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            if (selectedRoom) {
                              sendMessage();
                            } else if (selectedDM) {
                              sendDirectMessage(selectedDM.id, newMessage);
                              setNewMessage('');
                            }
                          }
                        }}
                        disabled={sending}
                        className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-blue-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300/30 focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder-gray-500 shadow-lg"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        💭
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        if (selectedRoom) {
                          sendMessage();
                        } else if (selectedDM) {
                          sendDirectMessage(selectedDM.id, newMessage);
                          setNewMessage('');
                        }
                      }}
                      disabled={!newMessage.trim() || sending}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send
                        </>
                      )}
                    </Button>
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
