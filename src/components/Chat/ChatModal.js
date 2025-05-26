// src/components/Chat/ChatModal.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { sendMessage, listenToMessages } from '../../services/chatService';
import ChatMessage from './ChatMessage';
import LoadingSpinner from '../Common/LoadingSpinner';
import './ChatModal.css'; // Create this CSS file

const ChatModal = ({ isOpen, onClose, chatData, otherUserName }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null); // To scroll to bottom

  useEffect(() => {
    if (!isOpen || !chatData?.id || !currentUser) return;

    setLoadingMessages(true);
    setError('');
    const unsubscribe = listenToMessages(chatData.id, (fetchedMessages) => {
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (err) => {
        setError("Failed to load messages.");
        setLoadingMessages(false);
        console.error(err);
    });

    return () => unsubscribe(); // Cleanup listener on unmount or when chat changes
  }, [isOpen, chatData, currentUser]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatData?.id || !currentUser) return;

    // Determine receiverId
    const receiverId = chatData.participants.find(pId => pId !== currentUser.uid);
    if (!receiverId) {
        console.error("Could not determine receiver for chat:", chatData);
        setError("Error sending message: Could not determine recipient.");
        return;
    }

    try {
      await sendMessage(chatData.id, currentUser.uid, receiverId, newMessage.trim());
      setNewMessage(''); // Clear input field
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  if (!isOpen) return null;

  const modalTitle = otherUserName ? `Chat with ${otherUserName}` : 'Chat';

  return (
    <div className="chat-modal-overlay" onClick={onClose}> {/* Close on overlay click */}
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside modal */}
        <div className="chat-modal-header">
          <h3>{modalTitle}</h3>
          <button onClick={onClose} className="close-modal-button">×</button>
        </div>
        <div className="chat-modal-body">
          {loadingMessages && <LoadingSpinner />}
          {error && <p className="error-message">{error}</p>}
          {!loadingMessages && !error && messages.length === 0 && (
            <p className="no-messages">No messages yet. Start the conversation!</p>
          )}
          {!loadingMessages && !error && messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} /> {/* For scrolling to bottom */}
        </div>
        <form onSubmit={handleSendMessage} className="chat-modal-footer">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={loadingMessages}
          />
          <button type="submit" className="send-button" disabled={loadingMessages || !newMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;