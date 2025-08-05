import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import VoiceRecorder from './VoiceRecorder';

const socket = io('http://localhost:4000'); // Connect to your backend

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Listen for new messages
  useEffect(() => {
    socket.on('new-message', (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    socket.on('read-receipt', (messageId) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    });

    // Clean up event listeners
    return () => {
      socket.off('new-message');
      socket.off('read-receipt');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send-message', { 
        text: message,
        user: 'You',
        id: Date.now() // Add unique ID for read receipts
      });
      setMessage('');
    }
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#F5F5DC' // Cream background
    }}>
      {/* Message display */}
      <div style={{ height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            background: msg.user === 'You' ? '#722F37' : '#8D4E53',
            color: 'white',
            padding: '10px',
            margin: '5px',
            borderRadius: '10px',
            position: 'relative'
          }}>
            <strong>{msg.user}:</strong> {msg.text}
            {msg.voiceNote && (
              <audio controls src={msg.voiceNote} style={{ display: 'block', marginTop: '5px' }} />
            )}
            {msg.isRead && <span style={{ marginLeft: '5px' }}>✓✓</span>}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div style={{ display: 'flex', marginTop: '10px', position: 'relative' }}>
        <button 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            background: '#722F37',
            color: 'white',
            border: 'none',
            padding: '10px',
            marginRight: '5px'
          }}
        >
          😊
        </button>

        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '50px', left: '0', zIndex: '100' }}>
            <Picker 
              onSelect={(emoji) => {
                setMessage(prev => prev + emoji.native);
                setShowEmojiPicker(false);
              }} 
            />
          </div>
        )}

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: '1', padding: '10px' }}
        />

        <button 
          onClick={sendMessage}
          style={{ 
            background: '#722F37', 
            color: 'white',
            border: 'none',
            padding: '10px',
            marginLeft: '5px'
          }}
        >
          Send
        </button>
        
        <VoiceRecorder onRecordingComplete={(blob) => {
          const audioUrl = URL.createObjectURL(blob);
          socket.emit('send-message', {
            user: 'You',
            voiceNote: audioUrl,
            id: Date.now()
          });
        }} />
      </div>
    </div>
  );
}

export default App;