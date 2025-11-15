import React, { useState, useEffect } from 'react';
import './BlockList.css'; // Reuse styles from BlockList

function FriendList() {
  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser && storedUser !== "undefined"
    ? JSON.parse(storedUser).userName
    : null;

  const [friends, setFriends] = useState([]);
  const [inputUsername, setInputUsername] = useState("");

  // Fetch friends list from backend
  useEffect(() => {
    if (!currentUser) return;
    fetch(`/friendList?action=getFriends`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.status && Array.isArray(data.data)) {
          setFriends(data.data.map(u => u.userName));
        } else {
          setFriends([]);
        }
      });
  }, [currentUser]);

  const handleAddFriend = () => {
    const normalized = inputUsername.trim().toLowerCase();
    if (!normalized) return;
    fetch(`/friendList?action=addFriend&friendUser=${encodeURIComponent(normalized)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(res => {
        if (res.status) {
          alert("Friend added!");
          setFriends(f => [...f, normalized]);
        } else {
          alert(res.message || "Failed to add friend.");
        }
      });
    setInputUsername("");
  };

  const handleRemoveFriend = (friend) => {
    fetch(`/friendList?action=removeFriend&friendUser=${encodeURIComponent(friend)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(res => {
        if (res.status) {
          alert("Friend removed!");
          setFriends(friends.filter(f => f !== friend));
        } else {
          alert(res.message || "Failed to remove friend.");
        }
      });
  };

  if (!currentUser) return <div>Please log in to view your friends list.</div>;

  return (
    <div className="blocklist-container">
      <h2>Friends List</h2>
      <div className="blocklist-input-group">
        <input
          type="text"
          placeholder="Enter username to add as friend"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
        />
        <button onClick={handleAddFriend}>Add</button>
      </div>
      <div id="block-list">
        {friends.length === 0 ? (
          <p>No friends</p>
        ) : (
          friends.map((username, idx) => (
            <div key={idx} className="block-list-item">
              {username}
              <button className="remove-button" onClick={() => handleRemoveFriend(username)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FriendList;