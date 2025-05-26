// src/pages/ChatListPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserChats } from '../services/chatService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ChatModal from '../components/Chat/ChatModal'; // Re-use the modal
import './ChatListPage.css'; // Create this CSS

const ChatListPage = () => {
  const { currentUser, currentUserData } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatData, setSelectedChatData] = useState(null);
  const [selectedChatOtherUserName, setSelectedChatOtherUserName] = useState('');


  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError("Please log in to view your chats.");
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      setError('');
      try {
        const userChats = await getUserChats(currentUser.uid);
        setChats(userChats);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
        setError("Could not load your conversations.");
      }
      setLoading(false);
    };

    fetchChats();
  }, [currentUser]);

  const openChatModal = (chat) => {
    setSelectedChatData(chat);
    // Determine the other user's name from participantInfo
    const otherUserId = chat.participants.find(pId => pId !== currentUser.uid);
    const otherUserInfo = chat.participantInfo && chat.participantInfo[otherUserId];
    setSelectedChatOtherUserName(otherUserInfo?.name || 'User');
    setIsChatModalOpen(true);
  };

  const formatTimestamp = (firebaseTimestamp) => {
    if (!firebaseTimestamp) return 'No recent messages';
    const date = firebaseTimestamp.toDate();
    return date.toLocaleString(); // Or any other format
  };


  if (loading) return <div className="page-container"><LoadingSpinner /></div>;

  return (
    <div className="page-container chat-list-page">
      <h2>Your Conversations</h2>
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && chats.length === 0 && (
        <p>You have no active conversations yet. Start chatting from a pet's detail page!</p>
      )}
      {!loading && !error && chats.length > 0 && (
        <ul className="chat-list">
          {chats.map((chat) => {
            const otherUserId = chat.participants.find(pId => pId !== currentUser.uid);
            const otherUserInfo = chat.participantInfo ? chat.participantInfo[otherUserId] : null;
            const otherName = otherUserInfo?.name || 'Unknown User';
            const lastMessageText = chat.lastMessage?.text ?
              (chat.lastMessage.text.length > 50 ? chat.lastMessage.text.substring(0, 47) + "..." : chat.lastMessage.text)
              : "No messages yet";
            const lastMessageTimestamp = chat.lastMessageTimestamp ? formatTimestamp(chat.lastMessageTimestamp) : '';


            return (
              <li key={chat.id} className="chat-list-item" onClick={() => openChatModal(chat)}>
                <div className="chat-item-avatar"> {/* Placeholder for avatar */}
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <div className="chat-item-info">
                  <span className="chat-item-name">{otherName}</span>
                  <p className="chat-item-last-message">{lastMessageText}</p>
                </div>
                <span className="chat-item-timestamp">{lastMessageTimestamp}</span>
              </li>
            );
          })}
        </ul>
      )}

      {isChatModalOpen && selectedChatData && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          chatData={selectedChatData}
          otherUserName={selectedChatOtherUserName}
        />
      )}
    </div>
  );
};

export default ChatListPage;