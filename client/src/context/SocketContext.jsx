import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const { info } = useToast();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin);

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to server');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setConnected(false);
    });

    // Handle incoming message notifications
    socketInstance.on('new_student_message', (data) => {
      if (user.role === 'admin') {
        info(`New message from ${data.studentName}: "${data.message.content.substring(0, 35)}..."`);
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    socketInstance.on('new_admin_message', (data) => {
      if (user.role === 'student') {
        info(`New message from Instructor: "${data.message.content.substring(0, 35)}..."`);
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, connected, unreadChatCount, setUnreadChatCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export default SocketContext;
