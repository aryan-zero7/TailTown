// src/services/chatService.js
import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from '../firebase/firebaseConfig';
  
  const CHATS_COLLECTION = 'chats';
  
  /**
   * Generates a unique chat ID based on two user UIDs, sorted alphabetically.
   * Ensures UIDs are valid strings.
   * @param {string} uid1
   * @param {string} uid2
   * @returns {string} The generated chat ID.
   * @throws {Error} if UIDs are not valid strings.
   */
  const generateChatId = (uid1, uid2) => {
    if (!uid1 || typeof uid1 !== 'string' || !uid1.trim() ||
        !uid2 || typeof uid2 !== 'string' || !uid2.trim()) {
      console.error("generateChatId: UIDs must be valid non-empty strings.", { uid1, uid2 });
      throw new Error("Cannot generate chat ID with invalid or empty UIDs.");
    }
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };
  
  /**
   * Gets an existing chat or creates a new one between two users.
   * @param {object} localUserInfo - Info for the currently logged-in user. Expected: { uid: string, name: any, role: any }
   * @param {object} remoteUserInfo - Info for the other user in the chat. Expected: { uid: string, name: any, role: any }
   * @returns {Promise<object>} The chat document data including its ID.
   * @throws {Error} if user information is incomplete or a Firestore error occurs.
   */
  export const getOrCreateChat = async (localUserInfo, remoteUserInfo) => {
    console.log("[ChatService] getOrCreateChat initiated with localUser:", JSON.stringify(localUserInfo), "remoteUser:", JSON.stringify(remoteUserInfo));
  
    if (!localUserInfo || typeof localUserInfo.uid !== 'string' || !localUserInfo.uid.trim()) {
      const errorMsg = "Local user information is incomplete (missing or invalid UID).";
      console.error("[ChatService] getOrCreateChat Error:", errorMsg, { localUserInfo });
      throw new Error(errorMsg);
    }
    if (!remoteUserInfo || typeof remoteUserInfo.uid !== 'string' || !remoteUserInfo.uid.trim()) {
      const errorMsg = "Remote user information is incomplete (missing or invalid UID).";
      console.error("[ChatService] getOrCreateChat Error:", errorMsg, { remoteUserInfo });
      throw new Error(errorMsg);
    }
  
    const chatId = generateChatId(localUserInfo.uid, remoteUserInfo.uid);
    console.log("[ChatService] Generated chatId:", chatId);
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  
    try {
      const chatDocSnap = await getDoc(chatDocRef);
  
      if (chatDocSnap.exists()) {
        console.log("[ChatService] Chat already exists:", chatId, chatDocSnap.data());
        return { id: chatDocSnap.id, ...chatDocSnap.data() };
      } else {
        console.log("[ChatService] Chat does not exist, creating new chat:", chatId);
  
        // Aggressively ensure name and role are strings for participantInfo
        const localName = String(localUserInfo.name || localUserInfo.email?.split('@')[0] || `User ${localUserInfo.uid.substring(0, 6)}`);
        const localRole = String(localUserInfo.role || 'User'); // Default to 'User' if role is missing
        const remoteName = String(remoteUserInfo.name || remoteUserInfo.email?.split('@')[0] || `User ${remoteUserInfo.uid.substring(0, 6)}`);
        const remoteRole = String(remoteUserInfo.role || 'User'); // Default to 'User'
  
        const newChatData = {
          participants: [localUserInfo.uid, remoteUserInfo.uid].sort(), // Store participants sorted for consistency (optional, but can help)
          participantInfo: {
            [localUserInfo.uid]: { name: localName, role: localRole },
            [remoteUserInfo.uid]: { name: remoteName, role: remoteRole },
          },
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTimestamp: null,
        };
  
        console.log("-------------------------------------------");
        console.log("[ChatService] EXACT chatId for setDoc:", chatId); // Should match the one generated above
        console.log("[ChatService] EXACT newChatData for setDoc:", JSON.stringify(newChatData, null, 2));
        console.log("-------------------------------------------");
  
        await setDoc(chatDocRef, newChatData);
        console.log("[ChatService] New chat document CREATED in Firestore:", chatId);
        // Return data consistent with what was written, serverTimestamp will resolve
        return { id: chatId, ...newChatData, createdAt: new Date() }; // Approximate client time
      }
    } catch (error) {
      console.error("[ChatService] Firestore error in getOrCreateChat:", error.code, error.message, error);
      if (error.code === 'permission-denied') {
        // This specific message will be shown to the user in PetDetailPage
        throw new Error("Permission denied by Firestore rules when trying to create/access chat. Check 'chats' collection 'create' rule and ensure data matches rule conditions (UIDs, participantInfo structure, name/role as strings, chatId format).");
      }
      throw new Error(`Failed to get or create chat: ${error.message || 'Unknown Firestore error'}`);
    }
  };
  
  export const sendMessage = async (chatId, senderId, receiverId, text) => {
    if (!chatId || !senderId || !receiverId || !text || typeof text.trim() !== 'string' || !text.trim()) {
      const errorMsg = "Cannot send message with missing or invalid information.";
      console.error("sendMessage Error:", errorMsg, { chatId, senderId, receiverId, text });
      throw new Error(errorMsg);
    }
    try {
      const messagesColRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
      const timestamp = serverTimestamp(); // Use the same timestamp object
      const messageData = {
        senderId,
        receiverId,
        text: text.trim(),
        timestamp: timestamp,
        isRead: false,
      };
      const messageDocRef = await addDoc(messagesColRef, messageData);
  
      const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
      await setDoc(chatDocRef, {
        lastMessage: { text: messageData.text, senderId, timestamp: timestamp },
        lastMessageTimestamp: timestamp
      }, { merge: true });
  
      return { id: messageDocRef.id, ...messageData };
    } catch (error) {
      console.error("[ChatService] Error sending message:", error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  };
  
  export const listenToMessages = (chatId, callback, errorCallback) => {
    if (!chatId || typeof chatId !== 'string') {
      const errorMsg = "Chat ID is invalid or undefined for listening to messages.";
      console.error("listenToMessages Error:", errorMsg, { chatId });
      if (errorCallback) errorCallback(new Error(errorMsg));
      return () => {};
    }
    const messagesColRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
    const q = query(messagesColRef, orderBy('timestamp', 'asc'));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages);
    }, (error) => {
      console.error("[ChatService] Error listening to messages:", error);
      if (errorCallback) errorCallback(error);
    });
    return unsubscribe;
  };
  
  export const getUserChats = async (userId) => {
    if (!userId || typeof userId !== 'string') {
      console.error("getUserChats: User ID is invalid or undefined.");
      return [];
    }
    try {
      const chatsColRef = collection(db, CHATS_COLLECTION);
      const q = query(
        chatsColRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTimestamp', 'desc') // Nulls last if no messages yet
      );
      const querySnapshot = await getDocs(q);
      const chats = [];
      querySnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() });
      });
      return chats;
    } catch (error) {
      console.error("[ChatService] Error fetching user chats:", error);
      throw new Error(`Failed to fetch user chats: ${error.message}`);
    }
  };