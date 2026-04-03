import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { X, Send, User, ChevronLeft, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { format, formatDistanceToNow, isToday } from 'date-fns';

const ChatWindow = () => {
    const { user } = useContext(AuthContext);
    const { 
        messages, 
        conversations, 
        activeChatUser, 
        setActiveChatUser, 
        isChatOpen, 
        setIsChatOpen, 
        sendMessage,
        openChat
    } = useContext(ChatContext);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        if (activeChatUser) {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeChatUser]);

    if (!isChatOpen) return null;

    const handleSend = (e) => {
        e.preventDefault();
        if (newMessage.trim() && activeChatUser) {
            sendMessage(activeChatUser._id, newMessage);
            setNewMessage('');
        }
    };

    const getAvatarColor = (name) => {
        const colors = [
            'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 
            'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-rose-500'
        ];
        const index = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index] || 'bg-slate-500';
    };

    const formatTimestamp = (date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isToday(d)) return format(d, 'HH:mm');
        return formatDistanceToNow(d, { addSuffix: false });
    };

    // --- Sub-Component: Conversation List ---
    const ConversationList = () => (
        <div className="flex flex-col h-full bg-white animate-slide-up">
            <div className="bg-slate-900 px-5 py-4 text-white flex justify-between items-center shadow-lg relative z-10">
                <div className="flex items-center gap-2.5">
                    <div className="bg-primary-500/20 p-2 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight">Messages</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Global Inbox</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsChatOpen(false)} 
                    className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="text-sm font-bold text-slate-600">No chats yet</p>
                        <p className="text-xs mt-2 leading-relaxed">Your conversations with room or mess owners will appear here.</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div 
                            key={conv._id}
                            onClick={() => openChat(conv)}
                            className={`px-5 py-3.5 border-b border-slate-100 hover:bg-white cursor-pointer transition-all flex items-center gap-4 group relative ${
                                conv.unreadCount > 0 ? 'bg-blue-50/30' : ''
                            }`}
                        >
                            <div className={`w-14 h-14 ${getAvatarColor(conv.name)} rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden`}>
                                {conv.profileImage ? (
                                    <img src={conv.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    conv.name.charAt(0)
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className={`text-[15px] truncate ${conv.unreadCount > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                        {conv.name}
                                    </h4>
                                    <span className={`text-[10px] whitespace-nowrap ${conv.unreadCount > 0 ? 'text-primary-600 font-bold' : 'text-slate-400'}`}>
                                        {formatTimestamp(conv.lastTimestamp)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                        {conv.lastMessage}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <div className="min-w-[18px] h-[18px] bg-primary-600 text-white rounded-full flex items-center justify-center text-[9px] font-black px-1 animate-pulse shadow-md shadow-primary-500/30">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Role badge */}
                            <div className="absolute top-1 right-5">
                                <span className="text-[7px] font-black uppercase tracking-tighter text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {conv.role}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    // If no active user, show the list
    if (!activeChatUser) return (
        <div className="fixed bottom-6 right-6 w-[340px] md:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col z-[200] border border-slate-200 overflow-hidden animate-slide-up ring-4 ring-slate-900/5">
            <ConversationList />
        </div>
    );

    // --- Main View: Message Thread ---
    return (
        <div className="fixed bottom-6 right-6 w-[340px] md:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col z-[200] border border-slate-200 overflow-hidden animate-slide-up ring-4 ring-slate-900/5">
            {/* Header */}
            <div className="bg-slate-900 px-4 py-3.5 text-white flex justify-between items-center shadow-lg relative z-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveChatUser(null)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className={`w-10 h-10 ${getAvatarColor(activeChatUser.name)} rounded-xl flex items-center justify-center text-white font-black shadow-lg overflow-hidden`}>
                        {activeChatUser.profileImage ? (
                            <img src={activeChatUser.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            activeChatUser.name?.charAt(0) || <User className="w-5 h-5 text-white/50" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-sm truncate max-w-[150px] tracking-tight">{activeChatUser.name}</p>
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider">Available</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setIsChatOpen(false)} 
                    className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                    <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30 scrollbar-hide pattern-grid-slate-100">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Beginning of conversation</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isMine = msg.sender === user?._id;
                    return (
                        <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-message-in`}>
                            <div className={`group relative max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] shadow-sm transition-all hover:shadow-md ${
                                isMine 
                                    ? 'bg-primary-600 text-white rounded-br-none' 
                                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                            }`}>
                                <p className="leading-[1.4] font-medium">{msg.message}</p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className={`text-[8px] font-black tracking-tighter ${isMine ? 'text-primary-100/60' : 'text-slate-400'}`}>
                                        {format(new Date(msg.createdAt || Date.now()), 'HH:mm')}
                                    </span>
                                    {isMine && (
                                        <div className="flex items-center opacity-60">
                                            {msg.isRead ? (
                                                <CheckCheck className="w-2.5 h-2.5 text-emerald-300" strokeWidth={3} />
                                            ) : (
                                                <Check className="w-2.5 h-2.5 text-primary-200" strokeWidth={3} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 relative shadow-[0_-4px_12px_rgba(15,23,42,0.02)]">
                <form onSubmit={handleSend} className="flex gap-2.5 items-center">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-primary-600 text-white p-3.5 rounded-2xl hover:bg-primary-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-30 disabled:translate-y-0 disabled:scale-100 transition-all shadow-xl shadow-primary-500/20 flex-shrink-0"
                    >
                        <Send className="w-5 h-5 fill-current" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
