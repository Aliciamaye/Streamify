/**
 * Real-time Chat Component
 * Live chat for music discussions and social interaction
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Smile, Paperclip, MoreVertical, Users, Hash,
  Music, Play, Pause, Volume2, Heart, Share2, Reply,
  Edit3, Trash2, Flag, Pin, Search, Settings, Crown,
  Star, Mic, MicOff, PhoneCall, Video, Plus, X,
  Clock, Check, CheckCheck, Eye, Zap, Headphones
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

interface ChatProps {
  className?: string;
  roomId?: string;
  isVisible?: boolean;
}

interface ChatMessage {
  id: string;
  user: ChatUser;
  content: string;
  type: 'text' | 'music' | 'emoji' | 'system';
  timestamp: Date;
  edited?: Date;
  replies?: ChatMessage[];
  reactions?: { emoji: string; users: string[]; count: number }[];
  musicData?: {
    trackId: string;
    title: string;
    artist: string;
    thumbnail?: string;
    isPlaying?: boolean;
  };
  isRead: boolean;
  isPinned: boolean;
}

interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'admin' | 'moderator' | 'member' | 'guest';
  badges: string[];
  isListening?: {
    track: string;
    artist: string;
    startedAt: Date;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  members: ChatUser[];
  description?: string;
  tags?: string[];
  activeUsers: number;
}

export const RealTimeChat: React.FC<ChatProps> = ({ 
  className = '', 
  roomId = 'general',
  isVisible = true 
}) => {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState<ChatUser[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock data
  const mockUser: ChatUser = {
    id: 'current-user',
    username: 'you',
    displayName: 'You',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    status: 'online',
    role: 'member',
    badges: ['🎵'],
    isListening: currentTrack ? {
      track: currentTrack.title,
      artist: currentTrack.artist,
      startedAt: new Date()
    } : undefined
  };

  const mockUsers: ChatUser[] = [
    {
      id: '1',
      username: 'musiclover',
      displayName: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      status: 'online',
      role: 'moderator',
      badges: ['🎧', '⭐'],
      isListening: {
        track: 'Bohemian Rhapsody',
        artist: 'Queen',
        startedAt: new Date(Date.now() - 120000)
      }
    },
    {
      id: '2', 
      username: 'beatmaster',
      displayName: 'Sam Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
      status: 'online',
      role: 'member',
      badges: ['🎵']
    }
  ];

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      user: mockUsers[0],
      content: 'Hey everyone! Just discovered this amazing track',
      type: 'text',
      timestamp: new Date(Date.now() - 300000),
      reactions: [
        { emoji: '🔥', users: ['2'], count: 1 },
        { emoji: '❤️', users: ['2', 'current-user'], count: 2 }
      ],
      isRead: true,
      isPinned: false
    },
    {
      id: '2',
      user: mockUsers[0],
      content: '',
      type: 'music',
      timestamp: new Date(Date.now() - 299000),
      musicData: {
        trackId: '1',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        thumbnail: 'https://example.com/queen.jpg',
        isPlaying: false
      },
      isRead: true,
      isPinned: false
    },
    {
      id: '3',
      user: mockUsers[1],
      content: 'Classic! Queen never gets old 👑',
      type: 'text',
      timestamp: new Date(Date.now() - 250000),
      replies: [
        {
          id: '3-1',
          user: mockUser,
          content: 'Absolutely agree! Their harmonies are incredible',
          type: 'text',
          timestamp: new Date(Date.now() - 240000),
          isRead: true,
          isPinned: false
        }
      ],
      isRead: true,
      isPinned: false
    }
  ];

  const emojis = ['😀', '😂', '❤️', '🔥', '👍', '👎', '🎵', '🎧', '⭐', '💯', '🙌', '👑'];

  useEffect(() => {
    setMessages(mockMessages);
    setActiveUsers([mockUser, ...mockUsers]);
    setCurrentRoom({
      id: roomId,
      name: '#general',
      type: 'public',
      members: [mockUser, ...mockUsers],
      description: 'General music discussion',
      tags: ['music', 'chat', 'recommendations'],
      activeUsers: 3
    });
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: mockUser,
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      isRead: false,
      isPinned: false,
      replies: replyingTo ? undefined : undefined
    };

    if (replyingTo) {
      // Add as reply to existing message
      setMessages(prev => prev.map(msg => 
        msg.id === replyingTo.id 
          ? { ...msg, replies: [...(msg.replies || []), message] }
          : msg
      ));
    } else {
      setMessages(prev => [...prev, message]);
    }

    setNewMessage('');
    setReplyingTo(null);
    messageInputRef.current?.focus();
  };

  const handleShareCurrentTrack = () => {
    if (!currentTrack) return;

    const musicMessage: ChatMessage = {
      id: Date.now().toString(),
      user: mockUser,
      content: '',
      type: 'music',
      timestamp: new Date(),
      musicData: {
        trackId: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        thumbnail: currentTrack.thumbnail,
        isPlaying: isPlaying
      },
      isRead: false,
      isPinned: false
    };

    setMessages(prev => [...prev, musicMessage]);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          // Toggle user's reaction
          const hasReacted = existingReaction.users.includes(mockUser.id);
          const updatedUsers = hasReacted 
            ? existingReaction.users.filter(id => id !== mockUser.id)
            : [...existingReaction.users, mockUser.id];
          
          return {
            ...msg,
            reactions: msg.reactions?.map(r => 
              r.emoji === emoji 
                ? { ...r, users: updatedUsers, count: updatedUsers.length }
                : r
            ).filter(r => r.count > 0)
          };
        } else {
          // Add new reaction
          return {
            ...msg,
            reactions: [
              ...(msg.reactions || []),
              { emoji, users: [mockUser.id], count: 1 }
            ]
          };
        }
      }
      return msg;
    }));
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Simulate sending typing indicator
    setIsTyping(prev => [...prev.filter(id => id !== mockUser.id)]);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(prev => prev.filter(id => id !== mockUser.id));
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageComponent = ({ message }: { message: ChatMessage }) => (
    <div className="group relative">
      <div className="flex gap-3 p-3 hover:bg-slate-800/30 rounded-lg">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {message.user.avatar ? (
              <img src={message.user.avatar} alt={message.user.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                {message.user.displayName.charAt(0)}
              </div>
            )}
          </div>
          
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
            message.user.status === 'online' ? 'bg-green-400' :
            message.user.status === 'away' ? 'bg-yellow-400' :
            message.user.status === 'busy' ? 'bg-red-400' : 'bg-slate-400'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{message.user.displayName}</span>
            
            {message.user.role === 'admin' && <Crown size={14} className="text-yellow-400" />}
            {message.user.role === 'moderator' && <Star size={14} className="text-blue-400" />}
            
            {message.user.badges.map(badge => (
              <span key={badge} className="text-sm">{badge}</span>
            ))}
            
            <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
            
            {message.edited && (
              <span className="text-xs text-slate-500">(edited)</span>
            )}
          </div>

          {/* Message Content */}
          {message.type === 'text' && (
            <p className="text-slate-300 break-words">{message.content}</p>
          )}

          {message.type === 'music' && message.musicData && (
            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3 max-w-sm">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                {message.musicData.thumbnail ? (
                  <img src={message.musicData.thumbnail} alt={message.musicData.title} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <Music className="w-6 h-6 text-slate-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{message.musicData.title}</p>
                <p className="text-slate-400 text-xs truncate">{message.musicData.artist}</p>
              </div>

              <button
                onClick={() => playTrack({ id: message.musicData!.trackId, title: message.musicData!.title, artist: message.musicData!.artist } as any)}
                className="p-2 text-green-400 hover:text-green-300 rounded-full transition-colors"
              >
                <Play size={16} />
              </button>
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map(reaction => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleAddReaction(message.id, reaction.emoji)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    reaction.users.includes(mockUser.id)
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
              
              <button
                onClick={() => setShowEmojiPicker(true)}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-full flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          )}

          {/* Replies */}
          {message.replies && message.replies.length > 0 && (
            <div className="mt-2 ml-4 border-l-2 border-slate-700 pl-3 space-y-2">
              {message.replies.map(reply => (
                <MessageComponent key={reply.id} message={reply} />
              ))}
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setReplyingTo(message)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            title="Reply"
          >
            <Reply size={14} />
          </button>
          
          <button
            onClick={() => handleAddReaction(message.id, '❤️')}
            className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
            title="React"
          >
            <Heart size={14} />
          </button>
          
          <button className="p-1 text-slate-400 hover:text-white rounded transition-colors">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className={`flex flex-col bg-slate-900/50 backdrop-blur-xl border-l border-slate-700 ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-slate-400" />
          <div>
            <h3 className="font-semibold text-white">{currentRoom?.name}</h3>
            <p className="text-xs text-slate-400">{currentRoom?.activeUsers} online</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <Users size={18} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
            <Search size={18} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {messages.map(message => (
          <MessageComponent key={message.id} message={message} />
        ))}
        
        {/* Typing Indicators */}
        {isTyping.length > 0 && (
          <div className="flex items-center gap-2 p-3 text-slate-400 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Reply size={14} className="text-slate-400" />
            <span className="text-slate-400">Replying to</span>
            <span className="text-white font-medium">{replyingTo.user.displayName}</span>
            <span className="text-slate-300 truncate max-w-xs">
              {replyingTo.content || (replyingTo.musicData && `${replyingTo.musicData.title} - ${replyingTo.musicData.artist}`)}
            </span>
          </div>
          
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message ${currentRoom?.name || '#general'}...`}
              className="w-full bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            {currentTrack && (
              <button
                onClick={handleShareCurrentTrack}
                className="p-2 text-green-400 hover:text-green-300 rounded-full transition-colors"
                title="Share current track"
              >
                <Music size={18} />
              </button>
            )}
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <Smile size={18} />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 bg-slate-800 border border-slate-700 rounded-lg p-3 grid grid-cols-6 gap-2 shadow-xl z-50">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  setNewMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="p-2 hover:bg-slate-700 rounded text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User List Sidebar */}
      {showUserList && (
        <div className="absolute top-0 right-0 w-64 h-full bg-slate-900 border-l border-slate-700 p-4 z-40">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Online Users</h4>
            <button
              onClick={() => setShowUserList(false)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {activeUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    user.status === 'online' ? 'bg-green-400' : 'bg-slate-400'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.displayName}</p>
                  {user.isListening && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Headphones size={10} />
                      <span className="truncate">{user.isListening.track}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeChat;