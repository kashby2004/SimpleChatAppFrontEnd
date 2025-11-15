import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router";

export const Conversations = () => {
  // Retrieve the current logged-in user from localStorage.
  // The stored user format should be the same as used in Login.js.
  const storedUser = localStorage.getItem("currentUser");
  const currentUser = (storedUser && storedUser !== "undefined")
    ? JSON.parse(storedUser).userName
    : null;

  const [convos, setConvos] = useState([]);

  const nav = useNavigate();

  // Wrap the loadAllConversations function with useCallback so that it
  // only changes when currentUser changes. This helps to prevent unnecessary
  // re-renders and meets ESLint dependency requirements.
  const loadAllConversations = useCallback(() => {
    // If there is no current user, do nothing.
    if (!currentUser) return;
    // Fetch all conversation summaries for the current user.
    // The API endpoint expects a 'username' query parameter.
    fetch(`/getConversations?username=${encodeURIComponent(currentUser)}`)
      .then(response => response.json())
      .then(jsonResult => {
         if (jsonResult.status) {
            console.log("Conversations data:", jsonResult.data);
            // Update the state with the retrieved conversation data.
            setConvos(jsonResult.data);
         } else {
            console.error("Failed to load conversations:", jsonResult.message);
         }
      })
      .catch(() => console.error('Failed to load conversations'));
  }, [currentUser]);

  // Use useEffect to call loadAllConversations whenever the currentUser changes.
  useEffect(() => {
    if (!currentUser) return;
    loadAllConversations();
  }, [currentUser, loadAllConversations]);

  // If there is no logged-in user, display a prompt to ask the user to log in.
  if (!currentUser) {
    return <div>Please log in to view your conversations.</div>;
  }

  // Render the conversations list in a table.
  return (
    <div>
      <h1>Conversations for {currentUser}</h1>
      <table className='all-conversations'>
        <thead>
          <tr>
            <th>Id</th>
            <th>Message Count</th>
            <th>To</th>
            <th>From</th>
          </tr>
        </thead>
        <tbody>
          {convos.map((convo, index) => (
            // When a conversation row is clicked, navigate to the detailed Conversation page.
            <tr key={index} onClick={() => nav('/conversation/' + convo.conversationId)}>
              <td>{convo.conversationId}</td>
              <td>{convo.messageCount}</td>
              <td>{convo.toId}</td>
              <td>{convo.fromId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Conversations;
