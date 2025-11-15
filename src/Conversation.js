import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from "react-router";

export const Conversation = ({ currentUser }) => {
  // If "currentUser" isn't passed via props, retrieve it from localStorage.
  // This ensures that the component always has an effective current user.
  const storedUser = localStorage.getItem("currentUser");
  const currentUserValue = (storedUser && storedUser !== "undefined")
    ? JSON.parse(storedUser).userName
    : null;
  const effectiveCurrentUser = currentUser || currentUserValue;

  // State definitions:
  // 'message' holds the new message input.
  // 'otherUser' holds the username of the conversation partner.
  // 'messages' is an array of messages fetched from the backend.
  const [message, setMessage] = useState('');
  const [otherUser, setOtherUser] = useState('');
  const [messages, setMessages] = useState([]);

  // React Router hooks
  const navigate = useNavigate();
  const params = useParams();
  // Determine if this is a new conversation (i.e., no conversationId in URL).
  const isNewConvo = !params.conversationId;

  // Wrap 'loadConversation' within useCallback to prevent ESLint warnings and unnecessary re-creations.
  const loadConversation = useCallback(() => {
    if (!params.conversationId) {
      return;
    }
    // Fetch conversation data by conversationId.
    fetch('/getConversation?conversationId=' + params.conversationId)
      .then(res => res.json())
      .then(jsonResult => {
        if (jsonResult.status) {
          console.log("Conversation data:", jsonResult.data);
          setMessages(jsonResult.data);
        } else {
          console.error("Failed to load conversation:", jsonResult.message);
        }
      })
      .catch(() => console.error('Failed to load conversation'));
  }, [params.conversationId]);

  // Load conversation data whenever the conversationId changes.
  useEffect(() => {
    if (params.conversationId) {
      loadConversation();
    }
  }, [params.conversationId, loadConversation]);

  // Determine the conversation partner (otherUser) based on:
  // 1. If messages exist: use the first message to decide which user is the recipient.
  // 2. If there are no messages but a conversationId is available: 
  //    parse the conversationId (expected format "user1_user2") and choose the username that doesn't match the current user.
  useEffect(() => {
    if (effectiveCurrentUser) {
      const normalizedCurrent = effectiveCurrentUser.trim().toLowerCase();
      if (messages.length > 0) {
        const msg = messages[0];
        let candidate = "";
        // If the sender ('fromId') is the current user, then the recipient is 'toId'; otherwise, it's the 'fromId'.
        if (msg.fromId.trim().toLowerCase() === normalizedCurrent) {
          candidate = msg.toId;
        } else {
          candidate = msg.fromId;
        }
        setOtherUser(candidate.trim().toLowerCase());
      } else if (params.conversationId) {
        // Parse the conversationId assumed to be in the format "user1_user2"
        const parts = params.conversationId.split("_");
        if (parts.length === 2) {
          const c0 = parts[0].trim().toLowerCase();
          const c1 = parts[1].trim().toLowerCase();
          let candidate = "";
          if (c0 === normalizedCurrent) {
            candidate = c1;
          } else {
            candidate = c0;
          }
          setOtherUser(candidate);
        } else {
          // If conversationId format is incorrect, clear otherUser and let the user manually input recipient.
          console.error("ConversationId format is incorrect:", params.conversationId);
          setOtherUser("");
        }
      }
    }
  }, [messages, effectiveCurrentUser, params.conversationId]);

  // Handle sending the message.
  // Before sending, validate that 'otherUser' is not empty.
  const handleSend = () => {
    if (!otherUser || otherUser.trim() === "") {
      alert("Recipient is not specified");
      return;
    }
    // Build the message DTO for transmission.
    const messageDto = {
      message: message,
      toId: otherUser  // 'otherUser' must be the correct recipient.
    };

    const httpSettings = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageDto)
    };

    // Send the message via the /sendMessage API.
    fetch('/sendMessage', httpSettings)
      .then(res => res.json())
      .then(jsonResult => {
        if (jsonResult.status) {
          console.log("Send message success:", jsonResult);
          setMessage('');
          // Navigate to the new conversation page if the backend returns a new conversationId.
          const newConvoId = jsonResult.data[0].conversationId;
          navigate('/conversation/' + newConvoId);
          // Refresh the conversation.
          loadConversation();
        } else {
          console.error("Send message error:", jsonResult.message);
          alert(jsonResult.message);
        }
      })
      .catch(() => console.error('Failed to send message'));
  };

  return (
    <div className="messaging-container">
      <h1>
        Conversation {params.conversationId ? params.conversationId : "(new conversation)"}
      </h1>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message-wrapper">
            <div>{msg.message || '...'}</div>
          </div>
        ))}
      </div>
      {/* If it's a new conversation or auto-parsing didn't yield a recipient,
          show an input field so the user can manually enter the recipient username. */}
      {(isNewConvo || otherUser === "") && (
        <div>
          <div>
            Recipient:{" "}
            <input 
              value={otherUser} 
              onChange={(e) => setOtherUser(e.target.value.trim().toLowerCase())} 
            />
          </div>
        </div>
      )}
      <div style={{ display: 'flex' }}>
        <textarea 
          style={{ flexGrow: 2 }} 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
        />
        <button style={{ width: '200px' }} onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Conversation;
