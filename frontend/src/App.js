import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import VoiceRecorder from './VoiceRecorder'; // Ensure VoiceRecorder is implemented and its button accepts className
import { AuthContext } from './context/AuthContext'; // Import AuthContext

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
const socket = io(BACKEND_URL);

function App() {
  const { user, logout } = useContext(AuthContext); 
  const [messages, setMessages] = useState([]); // Initialized with EMPTY array
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (user && user.username) {
      socket.emit('user-online', user.username);
    }

    socket.on('new-message', (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    socket.on('read-receipt', (messageId) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));
    });

    return () => {
      socket.off('new-message');
      socket.off('read-receipt');
    };
  }, [user]);

  const sendTextMessage = () => {
    if (inputMessage.trim() && user && user.username) {
      socket.emit('send-message', { 
        text: inputMessage,
        user: user.username,
      });
      setInputMessage('');
    }
  };

  const handleRecordingComplete = (blob) => {
    if (user && user.username) {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        socket.emit('send-message', {
          user: user.username,
          voiceNote: base64data,
        });
      };
    }
  };

  const onEmojiSelect = (emoji) => {
    setInputMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  if (!user || !user.username) {
    return <div style={{ backgroundColor: '#F5F5DC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading or Redirecting...</div>;
  }

  return (
    // Outer container for the whole chat page, takes full screen and is relative
    <div className="min-h-screen h-screen relative" style={{ backgroundColor: '#F5F5DC' }}>
      
      {/* Username and Logout at Top Left Corner */}
      {user && user.username && (
        <div className="absolute top-4 left-4 p-2 rounded-lg flex items-center space-x-2" style={{ backgroundColor: '#F5F5DC' }}>
          <span className="text-gray-700 text-sm">Logged in as: <span className="font-semibold" style={{ color: '#722F37' }}>{user.username}</span></span>
          <button onClick={logout} className="p-2 rounded-full bg-[#722F37] text-white hover:bg-[#5C262B] focus:outline-none focus:ring-2 focus:ring-[#722F37] transition-colors duration-200">
            Logout
          </button>
        </div>
      )}

      {/* Centered Chat Box */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-xl p-6 w-full max-w-md" style={{ backgroundColor: '#F5F5DC' }}>
        
        {/* Chat Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold" style={{ color: '#722F37' }}>RTalk </h1>
          {/* Logout button is now in the top-left corner, not here */}
        </div>

        {/* Message Display Area */}
        <div className="p-4 rounded-lg h-64 overflow-y-auto mb-4 border border-gray-200" style={{ backgroundColor: '#F5F5DC' }}>
          {messages.map((msg, i) => (
            <div 
              key={msg._id || i}
              className={`mb-2 p-3 rounded-lg relative max-w-[80%] text-white`}
              style={{ backgroundColor: '#722F37' }} /* All messages now have a single, consistent color */
            >
              <strong>{msg.user}:</strong> {msg.text}
              {msg.voiceNote && (
                <div className="flex items-center space-x-2">
                    <span className="text-xs">0:00</span>
                    <input type="range" min="0" max="100" value="0" className="flex-grow h-1 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-[#722F37]" />
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9.383 3.023A1.001 1.001 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1.001 1.001 0 011.09-.27zM14 8a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1zm-4 0a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                </div>
              )}
              {msg.timestamp && !isNaN(new Date(msg.timestamp)) && (
                <p className="text-xs text-gray-200 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              )}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="flex items-center mt-4 relative p-2 rounded-lg shadow-md" style={{ backgroundColor: 'white' }}>
          {/* Emoji Button */}
          <button 
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-full text-white mr-2 focus:outline-none focus:ring-2 focus:ring-[#722F37] transition-colors duration-200 hover:bg-[#5C262B] disabled:opacity-50"
            disabled={!user}
            style={{ backgroundColor: '#722F37' }}
          >
            😊
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-10">
              <Picker 
                onSelect={onEmojiSelect} 
                data={data}
              />
            </div>
          )}

          {/* Message Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
            placeholder="Type a message..."
            className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#722F37] bg-white"
            disabled={!user}
          />

          {/* Send Button */}
          <button 
            type="submit"
            onClick={sendTextMessage}
            className="p-2 rounded-full text-white ml-2 focus:outline-none focus:ring-2 focus:ring-[#722F37] transition-colors duration-200 hover:bg-[#5C262B] disabled:opacity-50"
            disabled={!user || !inputMessage.trim()}
            style={{ backgroundColor: '#722F37' }}
          >
            Send
          </button>
          
          {/* Voice Recorder Button */}
          <VoiceRecorder 
            onRecordingComplete={handleRecordingComplete} 
            disabled={!user}
            className="ml-2"
            buttonClassName="p-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#722F37] transition-colors duration-200 hover:bg-[#5C262B]"
            buttonStyle={{ backgroundColor: '#722F37' }}
            icon="🎤"
          />
        </div>
      </div>
    </div>
  );
}

export default App;