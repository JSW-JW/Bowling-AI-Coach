// src/App.js
import React, { useState, useRef, useEffect, useMemo } from 'react'; // useMemo import 추가
import Chat from './Chat';
import RoomSelection from './RoomSelection';

function UserPoseFeedback() {
  // --- 상태 관리 ---
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [markedTimestamps, setMarkedTimestamps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  
  // Chat and Room related states
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [clientId] = useState(() => `client_${Math.random().toString(36).substr(2, 9)}`);
  const [username] = useState(() => {
    // Generate unique username every time for testing room functionality  
    const newUsername = `볼러${Math.floor(Math.random() * 1000)}_${Math.random().toString(36).substr(2, 4)}`;
    return newUsername;
  });

  const videoRef = useRef(null);

  // --- 이벤트 핸들러 ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setMarkedTimestamps([]);
      setAnalysisResult(null);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!videoFile || markedTimestamps.length < 5) {
      setError("동영상을 선택하고 5개의 스텝을 모두 지정해야 합니다.");
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('video', videoFile);
    markedTimestamps.forEach((ts) => {
      formData.append(`timestamps`, ts);
    });

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const API_URL = `${API_BASE_URL}/analyze/interactive-steps`;
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || '서버에서 에러가 발생했습니다.');
      }

      const result = await response.json();
      setAnalysisResult(result);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 키보드 이벤트 처리를 위한 useEffect ---
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!videoRef.current) return;

      if (e.key === 's' && markedTimestamps.length < 5) {
        e.preventDefault();
        const currentTime = videoRef.current.currentTime;
        setMarkedTimestamps(prev => [...prev, currentTime].sort((a, b) => a - b));
      }

      const frameDuration = 1 / 30;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (videoRef.current.paused) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.pause();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - frameDuration);
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.pause();
          videoRef.current.currentTime += frameDuration;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [markedTimestamps]);

  // ==============================================================================
  // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
  // NEW: 분석 결과를 스텝별로 합치고 오름차순으로 정렬하는 로직
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  // ==============================================================================
  const sortedFeedback = useMemo(() => {
    if (!analysisResult) return [];

    const combined = {};

    // 1. Torso와 Foot 피드백을 스텝별로 합치기
    for (const [step, feedbacks] of Object.entries(analysisResult.feedback.torso)) {
      if (!combined[step]) combined[step] = [];
      combined[step].push(...feedbacks);
    }
    for (const [step, feedbacks] of Object.entries(analysisResult.feedback.foot)) {
      if (!combined[step]) combined[step] = [];
      combined[step].push(...feedbacks);
    }

    // 2. 스텝 번호(key)를 기준으로 오름차순 정렬
    return Object.entries(combined).sort(([stepA], [stepB]) => parseInt(stepA) - parseInt(stepB));
    
  }, [analysisResult]); // analysisResult가 변경될 때만 이 로직을 다시 실행


  // Chat and Room handlers
  const handleChatToggle = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setShowRoomSelection(false);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  const handleJoinRoomClick = () => {
    setShowRoomSelection(true);
  };

  // --- 렌더링 ---
  return (
    <>
      <div className="app-container">
        <header className="App-header">
          <h1>🎳 볼링 자세 분석 AI</h1>
          <p>동영상을 재생하며 5번의 스텝이 끝나는 지점에서 's' 키를 누르세요.</p>
          <div className="controls-guide">
            <span className="key-chip">Space : 재생/일시정지</span>
            <span className="key-chip">← : 뒤로 1프레임</span>
            <span className="key-chip">→ : 앞으로 1프레임</span>
            <span className="key-chip">s : 스텝 지정</span>
          </div>
          <div className="user-info">
            <span className="username-display">👤 {username}</span>
            <button className="room-btn" onClick={handleJoinRoomClick}>
              {currentRoom ? `📍 ${currentRoom.name}` : '🚪 Feedback Room 입장'}
            </button>
          </div>
        </header>

        <main>
          <div className="upload-section">
            <input type="file" accept="video/*" onChange={handleFileChange} />
          </div>

          {videoUrl && (
            <div className="video-container">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="video-element"
                onLoadedData={(e) => e.target.playbackRate = 0.5}
              ></video>
              <div className="status">
                <h3>진행 상태: {markedTimestamps.length} / 5 스텝</h3>
                <div className="timestamps">
                  {markedTimestamps.map((ts, index) => (
                    <span key={index} className="timestamp-chip">
                      스텝 {index + 1}: {ts.toFixed(2)}초
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={markedTimestamps.length < 5 || isLoading}
                >
                  {isLoading ? '분석 중...' : '분석하기'}
                </button>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </main>
      </div>

      {analysisResult && (
        <div className="results-section">
          <h2>분석 결과</h2>
          <div className="feedback-container">
            <h3>자세 피드백</h3>
            {/* --- 변경된 부분: 정렬된 sortedFeedback 데이터를 사용해 렌더링 --- */}
            <ul>
              {sortedFeedback.map(([step, feedbacks]) =>
                feedbacks.map((fb, i) => (
                  <li key={`${step}-${i}`}>
                    <strong>스텝 {step}:</strong> {fb}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="visuals-container">
            <h3>분석 시각화</h3>
            <div className="visuals-grid">
              {Object.entries(analysisResult.visualizations).map(([key, base64Image]) => (
                <div key={key} className="visual-item">
                  <h4>{key}</h4>
                  <img src={`data:image/jpeg;base64,${base64Image}`} alt={key} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}

export default UserPoseFeedback;