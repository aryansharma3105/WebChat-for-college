import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  User,
  ShieldCheck,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Layers,
  Users,
  FileText,
  Download,
  Image as ImageIcon,
  FileCode
} from 'lucide-react';
import { format } from 'date-fns';

export const AdminChat = () => {
  const { user } = useAuth();
  const { socket, connected, setUnreadChatCount } = useSocket();
  const { error, success } = useToast();
  const location = useLocation();

  // Tab: 'groups' or 'direct'
  const [activeTab, setActiveTab] = useState(location.state?.groupId ? 'groups' : 'groups');

  // Direct 1-on-1 state
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [studentTyping, setStudentTyping] = useState(false);

  // Group chat state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);

  // Shared input state
  const [newMessage, setNewMessage] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [search, setSearch] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Fetch 1-on-1 Conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations', { params: { search } });
      if (res.data.success) {
        setConversations(res.data.data);
        if (!selectedStudent && res.data.data.length > 0 && activeTab === 'direct') {
          setSelectedStudent(res.data.data[0].student);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  };

  // 2. Fetch Group Conversations
  const fetchGroups = async () => {
    try {
      const res = await api.get('/chat/groups');
      if (res.data.success) {
        setGroups(res.data.data);
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
    } finally {
      setLoadingConv(false);
    }
  };

  // 3. Fetch Direct Messages
  const fetchDirectMessages = async (studentId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/messages/${studentId}`);
      if (res.data.success) {
        setMessages(res.data.data);
        setUnreadChatCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      error('Failed to load message thread');
    } finally {
      setLoadingMessages(false);
    }
  };

  // 4. Fetch Group Messages
  const fetchGroupMessages = async (groupId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/groups/${groupId}/messages`);
      if (res.data.success) {
        setGroupMessages(res.data.data);
      }
    } catch (err) {
      error('Failed to load group messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial loads
  useEffect(() => {
    fetchConversations();
    fetchGroups();
  }, [search]);

  // Handle Direct Student Selection & Socket Joining
  useEffect(() => {
    if (activeTab === 'direct' && selectedStudent?.id) {
      fetchDirectMessages(selectedStudent.id);
      if (socket) {
        socket.emit('join_chat', { studentId: selectedStudent.id });
      }
    }

    return () => {
      if (socket && selectedStudent?.id) {
        socket.emit('leave_chat', { studentId: selectedStudent.id });
      }
    };
  }, [selectedStudent, activeTab, socket]);

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

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveDirect = (msg) => {
      if (selectedStudent && msg.studentId?.toString() === selectedStudent.id?.toString()) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };

    const handleReceiveGroup = ({ groupId, message }) => {
      if (selectedGroup && selectedGroup.id?.toString() === groupId?.toString()) {
        setGroupMessages((prev) => [...prev, message]);
      }
      fetchGroups();
    };

    const handleTyping = (data) => {
      if (selectedStudent && data.studentId === selectedStudent.id) {
        setStudentTyping(true);
      }
    };
    const handleStoppedTyping = (data) => {
      if (selectedStudent && data.studentId === selectedStudent.id) {
        setStudentTyping(false);
      }
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
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStoppedTyping);
    socket.on('user_group_typing', handleGroupTyping);
    socket.on('user_group_stopped_typing', handleGroupStoppedTyping);

    return () => {
      socket.off('receive_message', handleReceiveDirect);
      socket.off('receive_group_message', handleReceiveGroup);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStoppedTyping);
      socket.off('user_group_typing', handleGroupTyping);
      socket.off('user_group_stopped_typing', handleGroupStoppedTyping);
    };
  }, [socket, selectedStudent, selectedGroup, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, groupMessages]);

  // Send message handler (Direct or Group)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachmentFile) return;

    if (activeTab === 'groups') {
      if (!selectedGroup) return;

      try {
        if (attachmentFile) {
          const formData = new FormData();
          formData.append('content', newMessage.trim());
          formData.append('attachment', attachmentFile);

          const res = await api.post(`/chat/groups/${selectedGroup.id}/messages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.success) {
            setGroupMessages((prev) => [...prev, res.data.data]);
            setNewMessage('');
            setAttachmentFile(null);
            fetchGroups();
          }
        } else if (socket && connected) {
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
            fetchGroups();
          }
        }
      } catch (err) {
        error(err.response?.data?.message || 'Failed to send group message');
      }
    } else {
      // Direct 1-on-1
      if (!selectedStudent) return;

      try {
        if (attachmentFile) {
          const formData = new FormData();
          formData.append('content', newMessage.trim());
          formData.append('attachment', attachmentFile);

          const res = await api.post(`/chat/messages/${selectedStudent.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.success) {
            setMessages((prev) => [...prev, res.data.data]);
            setNewMessage('');
            setAttachmentFile(null);
            fetchConversations();
          }
        } else if (socket && connected) {
          socket.emit('send_message', {
            studentId: selectedStudent.id,
            content: newMessage.trim()
          });
          setNewMessage('');
        } else {
          const res = await api.post(`/chat/messages/${selectedStudent.id}`, {
            content: newMessage.trim()
          });
          if (res.data.success) {
            setMessages((prev) => [...prev, res.data.data]);
            setNewMessage('');
            fetchConversations();
          }
        }
      } catch (err) {
        error(err.response?.data?.message || 'Failed to send message');
      }
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.groupName.toLowerCase().includes(search.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col sm:flex-row bg-dark-900/90 backdrop-blur-2xl rounded-3xl border border-dark-700/80 shadow-2xl overflow-hidden">
      {/* Left Sidebar: Tab Switcher & Conversations List */}
      <div className="w-full sm:w-80 md:w-96 border-r border-dark-750 flex flex-col bg-dark-950/60">
        {/* Header & Tabs */}
        <div className="p-4 border-b border-dark-750">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" />
              Messaging Hub
            </h2>
          </div>

          {/* Tab Selector Buttons */}
          <div className="grid grid-cols-2 p-1 bg-dark-800/90 rounded-2xl mb-3 border border-dark-700">
            <button
              onClick={() => {
                setActiveTab('groups');
                if (groups.length > 0 && !selectedGroup) setSelectedGroup(groups[0]);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'groups'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Group Cohorts
            </button>

            <button
              onClick={() => {
                setActiveTab('direct');
                if (conversations.length > 0 && !selectedStudent) setSelectedStudent(conversations[0].student);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'direct'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              1-on-1 Direct
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder={activeTab === 'groups' ? 'Search group cohorts...' : 'Search students...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-dark-800/90 border border-dark-700 rounded-xl text-xs text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-dark-750/70">
          {activeTab === 'groups' ? (
            filteredGroups.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No cohorts found</div>
            ) : (
              filteredGroups.map((grp) => {
                const isSelected = selectedGroup?.id === grp.id;
                return (
                  <div
                    key={grp.id}
                    onClick={() => setSelectedGroup(grp)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-950/40 border-l-4 border-red-500 shadow-inner-red'
                        : 'hover:bg-dark-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md"
                        style={{ backgroundColor: grp.color || '#DC2626' }}
                      >
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {grp.groupName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {grp.lastMessage ? (
                            <>
                              <span className="font-semibold text-red-300">
                                {grp.lastMessage.senderRole === 'admin' ? 'You: ' : `${grp.lastMessage.senderId?.name?.split(' ')[0]}: `}
                              </span>
                              {grp.lastMessage.content}
                            </>
                          ) : (
                            `${grp.memberCount} enrolled students`
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
                      <span className="px-2 py-0.5 text-[10px] font-bold text-slate-300 bg-dark-800 border border-dark-700 rounded-full">
                        {grp.memberCount} std
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // 1-on-1 direct conversations list
            conversations.map((item) => {
              const isSelected = selectedStudent?.id === item.student.id;
              return (
                <div
                  key={item.student.id}
                  onClick={() => setSelectedStudent(item.student)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-950/40 border-l-4 border-red-500 shadow-inner-red'
                      : 'hover:bg-dark-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        item.student.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(item.student.name)}&background=dc2626&color=fff`
                      }
                      alt={item.student.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-dark-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.student.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.lastMessage ? item.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 ml-2">
                    {item.lastMessage && (
                      <span className="text-[10px] text-slate-500 mb-1">
                        {format(new Date(item.lastMessage.createdAt), 'h:mm a')}
                      </span>
                    )}
                    {item.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-black text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-full shadow-red-glow-sm">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-dark-900/90">
        {activeTab === 'groups' ? (
          selectedGroup ? (
            <>
              {/* Group Chat Header */}
              <div className="px-6 py-3.5 border-b border-dark-750 flex items-center justify-between bg-dark-950/40">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-md"
                    style={{ backgroundColor: selectedGroup.color || '#DC2626' }}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {selectedGroup.groupName}
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 shadow-red-glow-sm uppercase">
                        Instructor Broadcast Mode
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{selectedGroup.memberCount || selectedGroup.members?.length || 0} students enrolled</span>
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-dark-800 border border-dark-700 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>Full Broadcast Access</span>
                </div>
              </div>

              {/* Group Messages Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-dark-950/20">
                {groupMessages.map((msg) => {
                  const isAdminMsg = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2.5 ${
                        isAdminMsg ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isAdminMsg && (
                        <img
                          src={
                            msg.senderId?.profilePicture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderId?.name || 'Student')}&background=dc2626&color=fff`
                          }
                          alt={msg.senderId?.name || 'Student'}
                          title={`${msg.senderId?.name} (${msg.senderId?.rollNumber || 'Student'})`}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-dark-700"
                        />
                      )}

                      <div className="flex flex-col max-w-md">
                        {/* Sender Label for Group Chat */}
                        <div
                          className={`flex items-center gap-1.5 text-[11px] mb-1 px-1 ${
                            isAdminMsg ? 'justify-end text-red-400 font-bold' : 'justify-start text-slate-400 font-medium'
                          }`}
                        >
                          {isAdminMsg ? (
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-red-500" /> You (Instructor)
                            </span>
                          ) : (
                            <span>
                              {msg.senderId?.name || 'Student'}{' '}
                              {msg.senderId?.rollNumber && `[${msg.senderId.rollNumber}]`}
                            </span>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-dark-glass ${
                            isAdminMsg
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-br-none shadow-red-glow-sm'
                              : 'bg-dark-800 text-slate-200 border border-dark-700 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Admin Shared Attachment Box */}
                          {msg.attachment?.url && (
                            <div className="mt-2.5 pt-2.5 border-t border-white/20">
                              <a
                                href={msg.attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all ${
                                  isAdminMsg
                                    ? 'bg-black/30 text-white hover:bg-black/40 border border-white/20'
                                    : 'bg-dark-900 text-red-400 hover:underline shadow-sm'
                                }`}
                              >
                                {msg.attachment.fileType?.includes('image') ? (
                                  <ImageIcon className="w-4 h-4 shrink-0" />
                                ) : (
                                  <Download className="w-4 h-4 shrink-0" />
                                )}
                                <span className="truncate max-w-[200px]">{msg.attachment.name || 'View Attachment'}</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1 opacity-70" />
                              </a>
                            </div>
                          )}

                          <div
                            className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${
                              isAdminMsg ? 'text-red-200' : 'text-slate-500'
                            }`}
                          >
                            <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                            {isAdminMsg && <CheckCheck className="w-3 h-3 text-red-200" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Group Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-dark-750 bg-dark-950/60 flex items-center gap-3"
              >
                <label
                  title="Attach Material (PDF, Document, Image)"
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-dark-800 cursor-pointer rounded-xl transition-colors relative border border-transparent hover:border-dark-700"
                >
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                {attachmentFile && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-red-950/60 text-red-400 border border-red-800/60 rounded-xl truncate max-w-[150px]">
                    📎 {attachmentFile.name}
                  </span>
                )}

                <input
                  type="text"
                  placeholder={`Post message to ${selectedGroup.groupName} cohort...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() && !attachmentFile}
                  className="p-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl shadow-red-glow hover:shadow-red-glow-lg transition-all disabled:opacity-50 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-500">
              Select a group cohort from the left panel to open group discussion.
            </div>
          )
        ) : (
          // Direct 1-on-1 View
          selectedStudent ? (
            <>
              {/* Direct Chat Header */}
              <div className="px-6 py-3.5 border-b border-dark-750 flex items-center justify-between bg-dark-950/40">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedStudent.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=dc2626&color=fff`
                    }
                    alt={selectedStudent.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/30"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedStudent.email} | {selectedStudent.rollNumber || 'Student'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 bg-red-950/60 text-red-400 border border-red-800/60 rounded-full shadow-red-glow-sm">
                    1-on-1 Academic Support
                  </span>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-dark-950/20">
                {messages.map((msg) => {
                  const isAdminMsg = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2.5 ${
                        isAdminMsg ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isAdminMsg && (
                        <img
                          src={
                            msg.senderId?.profilePicture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=dc2626&color=fff`
                          }
                          alt="Student"
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-dark-700"
                        />
                      )}

                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-dark-glass ${
                          isAdminMsg
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
                              isAdminMsg ? 'text-white' : 'text-red-400'
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {msg.attachment.name || 'View Attachment'}
                          </a>
                        )}

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isAdminMsg ? 'text-red-200' : 'text-slate-500'
                          }`}
                        >
                          <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                          {isAdminMsg && <CheckCheck className="w-3 h-3 text-red-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {studentTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span>{selectedStudent.name} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Direct Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-dark-750 bg-dark-950/60 flex items-center gap-3"
              >
                <label className="p-2.5 text-slate-400 hover:text-white hover:bg-dark-800 cursor-pointer rounded-xl transition-colors">
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                {attachmentFile && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-red-950/60 text-red-400 border border-red-800/60 rounded-xl truncate max-w-[120px]">
                    {attachmentFile.name}
                  </span>
                )}

                <input
                  type="text"
                  placeholder="Type your response to student..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() && !attachmentFile}
                  className="p-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl shadow-red-glow hover:shadow-red-glow-lg transition-all disabled:opacity-50 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-500">
              Select a student conversation to start messaging.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AdminChat;
