## **Bowling-Posture-Guide** Application

#### **프로젝트 최종 목표**

본 앱은 **현대 파워 볼링(크랭커 스타일)의 기술 향상**을 목표로, 다음 두 가지 핵심 기능을 통해 사용자에게 체계적이고 과학적인 볼링 자세 훈련 경험을 제공합니다.

1.  **3D 캐릭터 레슨 섹션:** 전문 선수의 크랭커 스타일 5스텝 표준 자세를 3D 캐릭터 모델을 통해 시각적으로 학습하고 따라 할 수 있는 가이드를 제공합니다.
2.  **사용자 영상 분석 및 피드백:** 사용자가 업로드한 볼링 자세 영상을 MediaPipe의 Pose Detection 기술로 정밀 분석하여, 표준화된 분석 피드백과 시각화 자료를 제공합니다.

#### **주요 타겟 유저 (User Persona)**

  * 크랭커 스타일 볼러가 되기를 희망하는 입문자
  * 기존 스트로커 스타일에서 크랭커 스타일로 전향을 고려하는 아마추어 선수
  * 부상 위험 없이 올바른 자세를 익히고 교정하고 싶은 모든 볼러

-----

### **핵심 기능 상세 (Core Functions)**

#### **1. 3D 캐릭터를 통한 스텝별 레슨**

  * **목표:** 크랭커 스타일의 5스텝 접근법에 대한 표준 동작을 3D 캐릭터를 통해 시각적으로 명확하게 전달하여, 사용자가 각 스텝별 움직임을 쉽게 이해하고 연습할 수 있도록 돕습니다.
  * **주요 내용:**
      * **단계별 동작 시연:** 1스텝부터 5스텝(릴리즈)까지, 3D 캐릭터가 각 단계의 동작을 정면, 측면, 후면 등 다양한 각도에서 시연합니다.
      * **핵심 포인트 학습:** 각 스텝에서 중요한 무게 중심 이동, 신체 각도, 타이밍 등 핵심 요소를 텍스트와 시각 효과로 강조하여 설명합니다.
      * **인터랙티브 기능:** 특정 구간을 반복 재생하거나 슬로우 모션으로 확인하는 기능을 제공하여 상세한 동작 분석이 가능하도록 합니다.

#### **2. 사용자 영상 분석 및 피드백 (MVP)**

  * **목표:** 사용자가 자신의 볼링 자세 영상(후방 촬영 권장)을 업로드하면, 이를 자동으로 분석하여 각 스텝별 자세를 평가하고 구체적인 교정 가이드를 제공합니다.
  * **분석 로직 및 기술 요구사항:**
    1.  **스텝 자동 분할:** 영상에서 발의 움직임(정지/이동)을 감지하여 1스텝부터 5스텝까지의 프레임을 자동으로 추출하고 분할합니다.
    2.  **스텝별 정밀 분석:**
          * **상체 각도 (Torso Angle)**
              * **2→3 스텝:** 2스텝에서 3스텝으로 전환 시, 상체가 파워를 축적하기 위해 오른쪽으로 자연스럽게 기울어지는지 분석합니다.
                * 2스텝 보다 3스텝의 상체 기울기가 오른쪽으로 더 기울어야 합니다.
              * **3→4 스텝:** 3스텝에서 4스텝으로 전환 시, 상체가 파워를 축적하기 위해 오른쪽으로 자연스럽게 기울어지는지 분석합니다.
                * 3스텝 보다 4스텝의 상체 기울기가 오른쪽으로 더 기울어야 합니다.
              * **4→5 스텝:** 4스텝에서 만들어진 상체 각도가 릴리즈 순간까지 무너지지 않고 안정적으로 유지되는지 분석합니다.
                * 유지 여부에 대한 threshold 는 테스트 데이터에 따라 변동될 수 있습니다.
          * **발의 위치 (Foot Position)**
              * **2 스텝:** 오른발이 왼발 선상과 겹치는 크로스오버 스텝 여부를 검사합니다.
                * 공이 몸의 중심에 가깝게 떨어질 수 있도록 하기 위함입니다)
              * **3 스텝:** 왼발이 오른발의 x축과 과도하게 겹치지 않는지 검사합니다.
                * 왼발이 오른발의 x 축과 겹치는 부분이 많을 경우, 다음 스텝인 4스텝에서 오른발이 빠르게 피봇 스텝으로 전환하기 어렵습니다. 
              * **4 스텝:** 오른발이 왼발의 x축과 교차되며, 스텝의 보폭은 최소화되는지 분석합니다.
              * **5 스텝 (슬라이딩):** 체중이 오른발에 완전히 실린 후, 그 힘을 유지한 채 왼발이 슬라이딩되며, 릴리즈 직후 체중이 왼발로 순간적으로 전환되는지 분석합니다.
                * (현재 5스텝에 대한 기능은 미구현, 또한 구현 방향성 또한 변경될 예정)
    3.  **결과 및 피드백 제공:**
          * 각 분석 기준에 따라 스텝별 평가 결과를 도출하고, 교정이 필요한 부분에 대한 명확한 \*\*코멘트(Correction Text)\*\*를 제공합니다.
          * 사용자의 자세와 표준 자세를 비교하는 시각화 자료를 통해 직관적인 이해를 돕습니다.

-----

### **부가 기능: 커뮤니티 (채팅)**

  * **Redis Pub/Sub 기반 실시간 웹소켓 채팅 기능:** 사용자들이 볼링 자세나 정보에 대해 자유롭게 소통하고 교류할 수 있는 커뮤니티 공간을 제공합니다.

      * **채팅방 생성 및 참여 워크플로우**
        ```mermaid
        sequenceDiagram
            actor User
            participant App as Client App
            participant RoomsHook as useRooms (HTTP)
            participant Server as FastAPI
            participant RM as RoomManager
            participant WS as WebSocket Endpoint
            participant Redis as Redis Pub/Sub

            User->>App: open room list / create room
            App->>RoomsHook: fetchRooms() / createRoom()
            RoomsHook->>Server: GET/POST /rooms
            Server->>RM: list_rooms() / create_room()
            RM-->>Server: rooms / room
            Server-->>RoomsHook: rooms JSON / created room
            App->>RoomsHook: POST /rooms/{id}/join
            RoomsHook->>Server: join request
            Server->>RM: join_room(clientId, roomId)
            Server-->>RoomsHook: websocket_url
            App->>WS: connect /ws/{roomId}/{clientId}?username
            WS->>Redis: publish subscribe events
            Redis-->>WS: broadcast room events
            WS-->>App: room_info / messages / user_list
        ```
      * **메시지 전송 워크플로우**
        ```mermaid
        sequenceDiagram
            actor User
            participant Chat as Chat Component
            participant WSHook as useWebSocket
            participant WS as WebSocket Endpoint
            participant Redis as Redis Pub/Sub
            participant Other as Other Clients

            User->>Chat: send message
            Chat->>WSHook: sendMessage(text)
            WSHook->>WS: send chat_message JSON
            WS->>Redis: publish_to_room(message)
            Redis-->>WS: message (fan-out)
            WS-->>Other: {type: "message", data...}
            Other-->>Chat: render incoming message
        ```
