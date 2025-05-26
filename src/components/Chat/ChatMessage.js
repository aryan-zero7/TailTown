// src/components/Chat/ChatMessage.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ChatMessage.css'; // Create this CSS file

const ChatMessage = ({ message }) => {
  const { currentUser } = useAuth();
  const messageClass = message.senderId === currentUser?.uid ? 'sent' : 'received';
  const senderName = message.senderId === currentUser?.uid ? 'You' : (message.senderInfo?.name || 'Them'); // Assuming senderInfo is passed or fetched

  const formatTimestamp = (firebaseTimestamp) => {
    if (!firebaseTimestamp) return '';
    // Convert Firebase Timestamp to JavaScript Date object
    const date = firebaseTimestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-message ${messageClass}`}>
      <div className="message-bubble">
        {/* <strong className="message-sender">{senderName}</strong> */} {/* Optional: show sender name */}
        <p className="message-text">{message.text}</p>
        <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
      </div>
    </div>
  );
};

export default ChatMessage;