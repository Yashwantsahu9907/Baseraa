import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const ChatContext = createContext();

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3';

export const ChatProvider = ({ children }) => {
    const { user, api } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [totalUnread, setTotalUnread] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const isLocal = window.location.hostname === 'localhost';
    const socketUrl = isLocal ? 'http://localhost:5000' : 'https://baseraa.onrender.com';

    const playNotification = () => {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.play().catch(e => console.log('Audio play blocked'));
    };

    const fetchConversations = async () => {
        if (!user) return;
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
            
            // Also update total unread from the conversation list metadata if possible, 
            // or just hit the existing endpoint
            const unreadRes = await api.get('/messages/unread');
            setTotalUnread(unreadRes.data.totalUnread);
        } catch (err) {
            console.error('Fetch Conversations Error:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchConversations();

            const newSocket = io(socketUrl, {
                withCredentials: true
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                newSocket.emit('join_room', user._id);
            });

            newSocket.on('receive_message', (message) => {
                const isCurrentChat = activeChatUser && (message.sender === activeChatUser._id);
                
                if (isCurrentChat) {
                    setMessages((prev) => [...prev, message]);
                    // Instant Read: notify backend since chat is already open for this user
                    api.put(`/messages/read/${message.sender}`).catch(e => {});
                } else {
                    playNotification();
                    toast.info(`New message from owner!`, {
                        icon: '💬',
                    });
                    setTotalUnread(prev => prev + 1);
                }
                // Always refresh conversations list so the latest message snippet is correct
                fetchConversations();
            });

            newSocket.on('message_sent', (message) => {
                setMessages((prev) => [...prev, message]);
                fetchConversations(); // Sync list for the sender too
            });

            return () => newSocket.close();
        }
    }, [user, activeChatUser]);

    const fetchChatHistory = async (otherUser) => {
        try {
            const res = await api.get(`/messages/${otherUser._id}`);
            setMessages(res.data);
            
            await api.put(`/messages/read/${otherUser._id}`);
            fetchConversations(); // Update unread counts and snippet in the list
        } catch (error) {
            console.error('Fetch History Error:', error);
        }
    };

    const sendMessage = (receiverId, text) => {
        if (socket && text.trim()) {
            socket.emit('send_message', {
                sender: user._id,
                receiver: receiverId,
                message: text
            });
        }
    };

    const openChat = (otherUser) => {
        setActiveChatUser(otherUser);
        setIsChatOpen(true);
        fetchChatHistory(otherUser);
    };

    return (
        <ChatContext.Provider value={{ 
            socket, 
            messages, 
            conversations,
            activeChatUser, 
            setActiveChatUser,
            unreadCounts, 
            totalUnread,
            isChatOpen, 
            setIsChatOpen,
            openChat,
            sendMessage,
            fetchChatHistory,
            fetchConversations
        }}>
            {children}
        </ChatContext.Provider>
    );
};
