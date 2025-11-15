import React, { useState, useEffect } from 'react';
import './BlockList.css';

function BlockList() {
  // Retrieve the currently logged-in user from localStorage.
  // It assumes that the user info is stored as a JSON object like:
  //   { userName: 'xxx', ... }
  // If the stored value is "undefined" or missing, currentUser is set to null.
  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser && storedUser !== "undefined"
    ? JSON.parse(storedUser).userName
    : null;

  // Setup state to hold the list of blocked users and the value of the input box (for adding new users to block).
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [inputUsername, setInputUsername] = useState("");

  // This useEffect hook runs when the component mounts or when currentUser
  // changes. It defines and calls an async function to fetch the list of blocked users from the backend.
  useEffect(() => {
    async function fetchBlockedUsers() {
      if (!currentUser) return;
      try {
        const url = `/blockList?action=getBlockList&blockerId=${encodeURIComponent(
          currentUser.trim().toLowerCase()
        )}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // If the returned JSON object indicates success and contains a data array,
          // map each item to get the blocked user property (it may appear under different keys)
          if (data.status && Array.isArray(data.data)) {
            const blocked = data.data.map(item =>
              item.blockedId || item.username || item.blockedUser
            );
            setBlockedUsers(blocked);
          } else {
            setBlockedUsers([]);
          }
        } else {
          setBlockedUsers([]);
        }
      } catch (err) {
        setBlockedUsers([]);
      }
    }
    fetchBlockedUsers();
  }, [currentUser]);

  // This function checks whether a given username exists by sending 
  // a request to the backend endpoint. It returns a boolean based on the backend response.
  const userExists = async (username) => {
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const url = `/blockList?action=exists&username=${encodeURIComponent(normalizedUsername)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          return data.data[0].exists;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Function to send a block request to the backend.
  // It takes the blocker (current user) and the blocked username as parameters.
  const sendBlockRequest = async (blocker, blocked) => {
    try {
      const url = `/blockList?action=block&blockerId=${encodeURIComponent(blocker)}&blockedId=${encodeURIComponent(blocked)}`;
      const response = await fetch(url);
      return response.ok ? await response.json() : null;
    } catch (error) {
      return null;
    }
  };

  // Function to send an unblock request to the backend.
  const sendUnblockRequest = async (blocker, blocked) => {
    try {
      const url = `/blockList?action=unblock&blockerId=${encodeURIComponent(blocker)}&blockedId=${encodeURIComponent(blocked)}`;
      const response = await fetch(url);
      return response.ok ? await response.json() : null;
    } catch (error) {
      return null;
    }
  };

  // Handler for adding a new user to block.
  // 1. Normalizes the entered username.
  // 2. Checks if the user exists. If not, alerts and clears input.
  // 3. Sends a block request with currentUser as the blocker.
  // 4. If successful, refetches the blocked users list to update the UI.
  // 5. Clears the input field.
  const handleAddUser = async () => {
    const normalizedUsername = inputUsername.trim().toLowerCase();
    if (!normalizedUsername) return;

    const exists = await userExists(normalizedUsername);
    if (!exists) {
      alert(`User "${normalizedUsername}" does not exist.`);
      setInputUsername("");
      return;
    }
    
    const result = await sendBlockRequest(currentUser.trim().toLowerCase(), normalizedUsername);
    if (result && result.status) {
      alert("Block successful");
      // Refetch the blocked users list.
      async function refetch() {
        try {
          const url = `/blockList?action=getBlockList&blockerId=${encodeURIComponent(
            currentUser.trim().toLowerCase()
          )}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.status && Array.isArray(data.data)) {
              const blocked = data.data.map(item =>
                item.blockedId || item.username || item.blockedUser
              );
              setBlockedUsers(blocked);
            } else {
              setBlockedUsers([]);
            }
          } else {
            setBlockedUsers([]);
          }
        } catch (err) {
          setBlockedUsers([]);
        }
      }
      refetch();
    } else {
      alert("Block failed");
    }
    setInputUsername("");
  };

  // Handler for removing a blocked user.
  // Sends an unblock request using the current user's name as the blocker.
  // On success, refetches the blocked users list to update the UI.
  const handleRemoveUser = async (usernameToRemove) => {
    const result = await sendUnblockRequest(currentUser.trim().toLowerCase(), usernameToRemove);
    if (result && result.status) {
      alert("Unblock successful");
      async function refetch() {
        try {
          const url = `/blockList?action=getBlockList&blockerId=${encodeURIComponent(
            currentUser.trim().toLowerCase()
          )}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.status && Array.isArray(data.data)) {
              const blocked = data.data.map(item =>
                item.blockedId || item.username || item.blockedUser
              );
              setBlockedUsers(blocked);
            } else {
              setBlockedUsers([]);
            }
          } else {
            setBlockedUsers([]);
          }
        } catch (err) {
          setBlockedUsers([]);
        }
      }
      refetch();
    } else {
      alert("Unblock failed");
    }
  };

  // If the currentUser is null, it means no valid user is logged in.
  if (!currentUser) {
    return <div>Please log in to view your block list.</div>;
  }

  // Block list UI:
  // A header with "Block List"
  // An input field and button to add a new blocked user
  // A list of blocked users, each with a Remove button
  return (
    <div className="blocklist-container">
      <h2>Block List</h2>
      <div className="blocklist-input-group">
        <input 
          type="text" 
          placeholder="Enter username to block"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
        />
        <button onClick={handleAddUser}>Block</button>
      </div>
      <div id="block-list">
        {blockedUsers.length === 0 ? (
          <p>No blocked users</p>
        ) : (
          blockedUsers.map((username, index) => (
            <div key={index} className="block-list-item">
              {username}
              <button onClick={() => handleRemoveUser(username)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BlockList;
