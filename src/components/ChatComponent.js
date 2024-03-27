// ChatComponent.js

import React, { useState, useEffect } from 'react';
import SignalRService from './SignalRService';
import axios from 'axios';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    // Initialize SignalR connection when the component mounts
    SignalRService.startConnection();

    // Set up callback to handle received messages
    SignalRService.setReceiveMessageCallback(({ user, message }) => {
      setChatMessages(prevMessages => [...prevMessages, { senderId: user, message }]);
    });

    // Fetch chat messages from the database on component mount
    axios.get('http://localhost:5290/Chat/Get All Messages')
      .then((res) => {
        console.log("Chat messages:", res.data);
        setChatMessages(res.data); // Assuming res.data is an array of chat messages
      })
      .catch((error) => {
        console.error("Error fetching chat messages:", error);
      });
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleUserChange = (event) => {
    setUser(event.target.value);
  };

  const sendMessage = () => {
    const data = {
      senderId: user,
      receiverId: "abcd",
      message: message,
      timestamp: Date.now()
    }
    if (user && message) {
      axios.post('http://localhost:5290/Chat/Send Message', data)
        .then((res) => {
          alert('Message successfully sent');
          console.log(res.data);
          setMessage('');
        })
        .catch((error) => {
          console.log(error);
        })
      SignalRService.sendMessage(user, message); // Send message via SignalR
    }
  };

  return (
    <div>
      <div>
        {chatMessages.map((chat, index) => (
          <div key={index}>
            <p>{chat.senderId}: {chat.message}</p>
          </div>
        ))}
      </div>
      <input type="text" value={user} onChange={handleUserChange} placeholder="Enter your name" />
      <input type="text" value={message} onChange={handleMessageChange} placeholder="Enter your message" />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatComponent;
