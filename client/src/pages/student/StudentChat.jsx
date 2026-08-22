import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Send,
  Paperclip,
  ShieldCheck,
  CheckCheck,
  Lock,
  ExternalLink,
  Layers,
  Users,
  Info,
  Download,
  Image as ImageIcon,
  User,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export const StudentChat = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const { error, info } = useToast();
  const location = useLocation();

  // Tab: 'groups' or 'direct'
  const [activeTab, setActiveTab] = useState(location.state?.groupId ? 'groups' : 'groups');

  // Enrolled groups state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);

  // Direct 1-on-1 state
  const [messages, setMessages] = useState([]);
  const [adminTyping, setAdminTyping] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Common input state
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // 1. Fetch Enrolled Groups
  const fetchMyGroups = async () => {
    try {
      const res = await api.get('/chat/groups');
      if (res.data.success) {
        setGroups(res.data.data);
        // Check if navigated from MyGroups with state
        if (location.state?.groupId) {
          const matched = res.data.data.find((g) => g.id === location.state.groupId);
          if (matched) {
            setSelectedGroup(matched);
            return;
          }
        }
        if (!selectedGroup && res.data.data.length > 0) {
          setSelectedGroup(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Fetch Group Messages
  const fetchGroupMessages = async (groupId) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/groups/${groupId}/messages`);
      if (res.data.success) {
        setGroupMessages(res.data.data);
      }
    } catch (err) {
      error('Failed to load group messages');
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Direct 1-on-1 Messages
  const fetchDirectMessages = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/chat/messages/${user.id}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
    fetchDirectMessages();
  }, [user]);

  // Handle Group Selection & Socket Joining
  useEffect(() => {
    if (activeTab === 'groups' && selectedGroup?.id) {
      fetchGroupMessages(selectedGroup.id);
      if (socket) {
        socket.emit('join_group_chat', { groupId: selectedGroup.id });
      }
    }

    return () => {
      if (socket && selectedGroup?.id) {
        socket.emit('leave_group_chat', { groupId: selectedGroup.id });
      }
    };
  }, [selectedGroup, activeTab, socket]);

  // Handle Direct Chat Socket Joining
  useEffect(() => {
    if (activeTab === 'direct' && user?.id && socket) {
      socket.emit('join_chat', { studentId: user.id });
    }

    return () => {
      if (socket && user?.id) {
        socket.emit('leave_chat', { studentId: user.id });
      }
    };
  }, [activeTab, user, socket]);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket || !user?.id) return;

    // Direct 1-on-1 listeners
    const handleReceiveDirect = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    const handleAdminTyping = (data) => {
      if (data.role === 'admin') setAdminTyping(true);
    };
    const handleAdminStopped = (data) => {
      if (data.role === 'admin') setAdminTyping(false);
    };

    // Group chat listeners
    const handleReceiveGroup = ({ groupId, message }) => {
      if (selectedGroup && selectedGroup.id?.toString() === groupId?.toString()) {
        setGroupMessages((prev) => [...prev, message]);
      }
      fetchMyGroups();
    };

    const handleGroupTyping = (data) => {
      if (selectedGroup && data.groupId === selectedGroup.id && data.userId !== user?.id) {
        setGroupTypingUsers((prev) => (prev.includes(data.userName) ? prev : [...prev, data.userName]));
      }
    };

    const handleGroupStoppedTyping = (data) => {
      if (selectedGroup && data.groupId === selectedGroup.id) {
        setGroupTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    };

    socket.on('receive_message', handleReceiveDirect);
    socket.on('receive_group_message', handleReceiveGroup);
    socket.on('user_typing', handleAdminTyping);
    socket.on('user_stopped_typing', handleAdminStopped);
    socket.on('user_group_typing', handleGroupTyping);
    socket.on('user_group_stopped_typing', handleGroupStoppedTyping);

    return () => {
      socket.off('receive_message', handleReceiveDirect);
      socket.off('receive_group_message', handleReceiveGroup);
      socket.off('user_typing', handleAdminTyping);
      socket.off('user_stopped_typing', handleAdminStopped);
      socket.off('user_group_typing', handleGroupTyping);
      socket.off('user_group_stopped_typing', handleGroupStoppedTyping);
    };
  }, [socket, user, selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, groupMessages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachmentFile) return;

    if (activeTab === 'groups') {
      if (!selectedGroup) return;

      try {
        if (socket && connected) {
          socket.emit('send_group_message', {
            groupId: selectedGroup.id,
            content: newMessage.trim(),
            attachment: null
          });
          setNewMessage('');
        } else {
          const res = await api.post(`/chat/groups/${selectedGroup.id}/messages`, {
            content: newMessage.trim()
          });
          if (res.data.success) {
            setGroupMessages((prev) => [...prev, res.data.data]);
            setNewMessage('');
            fetchMyGroups();
          }
        }
      } catch (err) {
        error(err.response?.data?.message || 'Failed to send group message');
      }
    } else {
      // Direct 1-on-1
      try {
        if (attachmentFile) {
          const formData = new FormData();
          formData.append('content', newMessage.trim());
          formData.append('attachment', attachmentFile);

          const res = await api.post(`/chat/messages/${user.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.success) {
            setMessages((prev) => [...prev, res.data.data]);
            setNewMessage('');
            setAttachmentFile(null);
          }
        } else if (socket && connected) {
          socket.emit('send_message', {
            studentId: user.id,
            content: newMessage.trim()
          });
          setNewMessage('');
        } else {
          const res = await api.post(`/chat/messages/${user.id}`, {
            content: newMessage.trim()
          });
          if (res.data.success) {
            setMessages((prev) => [...prev, res.data.data]);
            setNewMessage('');
          }
        }
      } catch (err) {
        error(err.response?.data?.message || 'Failed to send message');
      }
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col sm:flex-row bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass overflow-hidden">
      {/* Left Sidebar: Tabs and Groups list */}
      <div className="w-full sm:w-80 md:w-88 border-r border-dark-750 flex flex-col bg-dark-900/60">
        <div className="p-4 border-b border-dark-750">
          <h2 className="text-base font-black text-white mb-3 flex items-center gap-2">
            <div className="p-1.5 bg-red-950/60 text-red-500 rounded-xl border border-red-900/50 shadow-red-glow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            Academic Chat
          </h2>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-dark-800 rounded-xl border border-dark-700">
            <button
              onClick={() => {
                setActiveTab('groups');
                if (groups.length > 0 && !selectedGroup) setSelectedGroup(groups[0]);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'groups'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Group Channels
            </button>

            <button
              onClick={() => setActiveTab('direct')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'direct'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Instructor 1-on-1
            </button>
          </div>
        </div>

        {/* List of Enrolled Groups */}
        <div className="flex-1 overflow-y-auto divide-y divide-dark-750/70">
          {activeTab === 'groups' ? (
            groups.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                You are not currently enrolled in any student groups.
              </div>
            ) : (
              groups.map((grp) => {
                const isSelected = selectedGroup?.id === grp.id;
                return (
                  <div
                    key={grp.id}
                    onClick={() => setSelectedGroup(grp)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-950/40 border-l-4 border-red-500'
                        : 'hover:bg-dark-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-red-glow-sm"
                        style={{ backgroundColor: grp.color || '#dc2626' }}
                      >
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {grp.groupName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {grp.lastMessage ? (
                            <>
                              <span className="font-semibold text-red-400">
                                {grp.lastMessage.senderRole === 'admin' ? 'Instructor: ' : `${grp.lastMessage.senderId?.name?.split(' ')[0]}: `}
                              </span>
                              {grp.lastMessage.content}
                            </>
                          ) : (
                            `${grp.memberCount} classmates`
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 ml-2">
                      {grp.lastMessage && (
                        <span className="text-[10px] text-slate-500 mb-1">
                          {format(new Date(grp.lastMessage.createdAt), 'h:mm a')}
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-[10px] font-bold text-slate-300 bg-dark-800 rounded-full border border-dark-700">
                        {grp.memberCount} std
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // Direct chat sidebar info card
            <div className="p-4 space-y-3">
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-bold text-white">
                    Private Academic Channel
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct communication between you and your instructor. Use for individual questions, personal extensions, or confidential feedback.
                </p>
              </div>

              <div className="p-3 bg-dark-800/90 rounded-2xl border border-dark-700 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white shadow-red-glow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Instructor Desk</p>
                  <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online / Active Portal
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-dark-900/40">
        {activeTab === 'groups' ? (
          selectedGroup ? (
            <>
              {/* Group Header */}
              <div className="px-6 py-3.5 border-b border-dark-750 flex items-center justify-between bg-dark-850/80">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-red-glow-sm"
                    style={{ backgroundColor: selectedGroup.color || '#dc2626' }}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      {selectedGroup.groupName}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-900/50 shadow-red-glow-sm">
                        Instructor Broadcast Channel
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{selectedGroup.memberCount || selectedGroup.members?.length || 0} Classmates enrolled</span>
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-xl bg-dark-800 text-slate-300 border border-dark-700">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Read-Only for Students</span>
                </div>
              </div>

              {/* Group Chat Notice Banner */}
              <div className="px-6 py-2.5 bg-amber-950/30 border-b border-amber-900/40 flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Group channels are instructor announcements only. You can view all messages and download attachments.</span>
                </span>
                <button
                  onClick={() => setActiveTab('direct')}
                  className="font-bold text-red-400 hover:text-red-300 hover:underline shrink-0 ml-2"
                >
                  Need help? Message Instructor 1-on-1 →
                </button>
              </div>

              {/* Group Messages Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-dark-950/40">
                {groupMessages.map((msg) => {
                  const isMe = msg.senderId?._id?.toString() === user?.id?.toString() ||
                               (msg.senderRole === 'student' && msg.senderId === user?.id);
                  const isAdminMsg = msg.senderRole === 'admin';

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        isAdminMsg ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-red-glow-sm">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        ) : (
                          <img
                            src={
                              msg.senderId?.profilePicture ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderId?.name || 'Classmate')}&background=dc2626&color=fff`
                            }
                            alt={msg.senderId?.name || 'Classmate'}
                            title={msg.senderId?.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-dark-700"
                          />
                        )
                      )}

                      <div className="flex flex-col max-w-md">
                        {/* Sender Name label */}
                        <div
                          className={`flex items-center gap-1.5 text-[11px] mb-1 px-1 ${
                            isMe
                              ? 'justify-end text-red-400 font-bold'
                              : isAdminMsg
                              ? 'justify-start text-red-400 font-bold'
                              : 'justify-start text-slate-400 font-semibold'
                          }`}
                        >
                          {isMe ? (
                            <span>You</span>
                          ) : isAdminMsg ? (
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-red-500" /> Instructor (Prof. Pankaj Sharma)
                            </span>
                          ) : (
                            <span>
                              {msg.senderId?.name || 'Classmate'}{' '}
                              {msg.senderId?.rollNumber && `(${msg.senderId.rollNumber})`}
                            </span>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-br-none shadow-red-glow-sm'
                              : isAdminMsg
                              ? 'bg-dark-800 border border-red-900/50 text-slate-100 rounded-bl-none shadow-red-glow-sm'
                              : 'bg-dark-800 text-slate-200 border border-dark-700 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Admin Attached Material Box (Clickable/Downloadable for Students!) */}
                          {msg.attachment?.url && (
                            <div className="mt-2.5 pt-2.5 border-t border-dark-700/80">
                              <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wide">
                                <ShieldCheck className="w-3 h-3" /> Material Attached by Instructor:
                              </div>
                              <a
                                href={msg.attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-dark-900 text-red-400 border border-red-900/50 hover:bg-red-950/50 shadow-red-glow-sm transition-all max-w-full"
                              >
                                {msg.attachment.fileType?.includes('image') ? (
                                  <ImageIcon className="w-4 h-4 shrink-0 text-red-400" />
                                ) : (
                                  <Download className="w-4 h-4 shrink-0 text-red-400" />
                                )}
                                <span className="truncate">{msg.attachment.name || 'Download Shared Document'}</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 ml-1" />
                              </a>
                            </div>
                          )}

                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? 'text-red-200' : 'text-slate-500'
                            }`}
                          >
                            <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-red-200" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Group Chat Read-Only Bar for Students */}
              <div className="p-4 border-t border-dark-750 bg-dark-850/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong className="text-slate-200">Broadcast Channel:</strong> Only the instructor can post messages and attachments in group channels.
                  </span>
                </div>

                <button
                  onClick={() => setActiveTab('direct')}
                  className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-red-glow transition-all shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Ask Question 1-on-1
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-sm">
              Select a group cohort from the left to participate in group chat.
            </div>
          )
        ) : (
          // Direct 1-on-1 with Instructor
          <>
            {/* Direct Header */}
            <div className="px-6 py-4 border-b border-dark-750 flex items-center justify-between bg-dark-850/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl text-white shadow-red-glow">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">
                    Instructor / Department Desk
                  </h2>
                  <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Direct 1-on-1 Academic Channel
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Private Academic Communication</span>
              </div>
            </div>

            {/* Direct Messages List */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-dark-950/40">
              <div className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700 text-center max-w-md mx-auto">
                <p className="text-xs font-bold text-white">
                  Welcome to the direct instructor chat
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Use this channel for quick academic clarifications, project questions, and office hour inquiries.
                </p>
              </div>

              {messages.map((msg) => {
                const isMe = msg.senderRole === 'student';
                return (
                  <div
                    key={msg._id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-red-glow-sm">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-br-none shadow-red-glow-sm'
                          : 'bg-dark-800 text-slate-200 border border-dark-700 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {msg.attachment?.url && (
                        <a
                          href={msg.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-2 flex items-center gap-1.5 text-xs font-bold underline ${
                            isMe ? 'text-white' : 'text-red-400 hover:text-red-300'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {msg.attachment.name || 'View Attachment'}
                        </a>
                      )}

                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                          isMe ? 'text-red-200' : 'text-slate-500'
                        }`}
                      >
                        <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-red-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {adminTyping && (
                <div className="flex items-center gap-2 text-xs text-red-400 italic">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Instructor is typing a response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Direct Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-dark-750 bg-dark-850/90 flex items-center gap-3"
            >
              <label className="p-2 text-slate-400 hover:text-white cursor-pointer rounded-xl hover:bg-dark-800 transition-colors">
                <Paperclip className="w-5 h-5" />
                <input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              {attachmentFile && (
                <span className="text-xs font-bold px-2.5 py-1 bg-red-950/60 text-red-400 border border-red-900/50 rounded-lg truncate max-w-[120px]">
                  {attachmentFile.name}
                </span>
              )}

              <input
                type="text"
                placeholder="Ask a question or send a message to instructor..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={!newMessage.trim() && !attachmentFile}
                className="p-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl shadow-red-glow hover:shadow-red-glow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentChat;
