// src/App.js (신규 파일)
import React, { useState } from 'react';
import Chat from './components/Chat';
import RoomSelection from './components/RoomSelection';
import ThreeDLesson from './components/ThreeDLesson';
import UserPoseFeedback from './components/UserPoseFeedback';
import './styles.css'; // 공용 스타일 (필요 시 생성)

export default function App() {
  // --- 뷰 상태 관리 ---
  const [view, setView] = useState('home'); // 'home', 'lesson', 'feedback'

  // --- 채팅/룸 상태 및 핸들러 (전역 관리) ---
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [clientId] = useState(() => `client_${Math.random().toString(36).substr(2, 9)}`);
  const [username] = useState(() => `볼러${Math.floor(Math.random() * 1000)}`);

  const handleChatToggle = () => setIsChatVisible(!isChatVisible);
  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setShowRoomSelection(false);
  };
  const handleLeaveRoom = () => setCurrentRoom(null);
  const handleJoinRoomClick = () => setShowRoomSelection(true);

  // --- 홈 화면 UI ---
  const renderHome = () => (
    <div className="container home-container">
      <header>
          <h1>🎳 Bowling Posture Guide</h1>
          <div className="user-info">
            <span className="username-display">👤 {username}</span>
            <button className="room-btn" onClick={handleJoinRoomClick}>
              {currentRoom ? `📍 ${currentRoom.name}` : '🚪 Feedback Room 입장'}
            </button>
          </div>
      </header>
      <div className="button-group">
        <button onClick={() => setView('lesson')}>3D 레슨 보기</button>
        <button onClick={() => setView('feedback')}>내 자세 분석하기</button>
      </div>
    </div>
  );

  return (
    <div className="app-root">
      {view !== 'home' && (
        <button className="back-button" onClick={() => setView('home')}>← 홈으로</button>
      )}

      {/* --- 현재 뷰에 따라 컴포넌트 렌더링 --- */}
      <div className="main-content">
        {view === 'home' && renderHome()}
        {view === 'lesson' && <ThreeDLesson />}
        {view === 'feedback' && <UserPoseFeedback />}
      </div>
      
      {/* --- 앱 전역에 걸쳐 표시될 채팅 및 룸 컴포넌트 --- */}
      <Chat
        clientId={clientId}
        username={username}
        roomId={currentRoom?.id}
        roomInfo={currentRoom}
        isVisible={isChatVisible}
        onToggle={handleChatToggle}
        onLeaveRoom={handleLeaveRoom}
      />
      {showRoomSelection && (
        <RoomSelection
          onRoomSelect={handleRoomSelect}
          onClose={() => setShowRoomSelection(false)}
        />
      )}
    </div>
  );
}