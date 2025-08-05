import { useState, useRef } from 'react';

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    
    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current);
      onRecordingComplete(audioBlob);
      audioChunks.current = [];
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
  };

  return (
    <button 
      onClick={isRecording ? stopRecording : startRecording}
      style={{
        background: isRecording ? '#ff4d4d' : '#722F37',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        marginLeft: '5px'
      }}
    >
      {isRecording ? '🛑' : '🎤'}
    </button>
  );
}