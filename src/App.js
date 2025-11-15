import './App.css';
import { BrowserRouter, Routes, Route, Link } from "react-router";
import { Conversation } from './Conversation';
import { Conversations } from './Conversations';
import { Login } from './Login';
import  BlockList from './BlockList';
import FriendList from './FriendList';

function App() {

  return (
    <BrowserRouter>
      <div>
        <Link to="/login">login</Link>
        <Link to="/conversations">Conversations</Link>
        <Link to="/blockList">blocklist</Link> 
        <Link to="/friendlist">Friends List</Link>       
        <Link to="/conversation">Conversation</Link>
      </div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/conversation/:conversationId?" element={<Conversation />} />
        <Route path="/blocklist" element={<BlockList />} />
        <Route path="/friendlist" element={<FriendList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;