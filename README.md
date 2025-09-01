## Bowling-Posture-Guide App

#### **Ultimate Project Goal**

This application aims to **enhance modern power bowling (cranker style) techniques** by providing a systematic and scientific bowling posture training experience through two core features:

1.  **3D Character Lesson Section:** Offers a visual guide for users to learn and follow the standard 5-step cranker style posture, demonstrated by a 3D character model.
2.  **User Video Analysis and Feedback:** Precisely analyzes a user's uploaded bowling posture video using MediaPipe's Pose Detection technology to provide standardized analysis feedback and visualizations.

#### **Primary Target User (User Persona)**

  * Beginners who aspire to become cranker style bowlers.
  * Amateur bowlers considering a transition from a stroker style to a cranker style.
  * All bowlers who want to learn and correct their posture properly to prevent the risk of injury.

-----

### **Core Functions in Detail**

#### **1. Step-by-Step Lessons via 3D Character**

  * **Objective:** To clearly convey the standard motions of the 5-step cranker style approach through a 3D character, helping users easily understand and practice the movements for each step.
  * **Key Contents:**
      * **Step-by-Step Demonstrations:** The 3D character demonstrates the motion for each phase, from Step 1 to Step 5 (the release), from various angles including front, side, and back.
      * **Learning Key Points:** Crucial elements for each step, such as center of gravity shift, body angles, and timing, are explained and emphasized with text and visual effects.
      * **Interactive Features:** Provides functions to replay specific sections or view them in slow motion, enabling detailed motion analysis.

#### **2. User Video Analysis and Feedback (MVP)**

  * **Objective:** To automatically analyze a user's uploaded bowling posture video (rear-view recording recommended), evaluate the posture at each step, and provide a specific correction guide.

  ![Torso Angle Analysis 출처: KPBA 신승현 프로](server/README/torso-angle-analysis.png)
  * **Analysis Logic and Technical Requirements:**
    1.  **Automatic Step Division:** Automatically detects the movement of the feet (stop/move) in the video to extract and divide the frames from Step 1 to Step 5.
    2.  **Detailed Step-by-Step Analysis:**
          * **Torso Angle**
              * **Step 3 → 4:** Analyzes if the torso naturally tilts to the right to accumulate power when transitioning from Step 3 to Step 4.
              * **Step 4 → 5:** Analyzes if the torso angle created in Step 4 is stably maintained until the moment of release without collapsing.
          * **Foot Position**
              * **Step 2:** Checks if the right foot is positioned on the same line as the left foot.
              * **Step 3:** Analyzes whether the left foot avoids excessively crossing the Z-axis path of the right foot (to prevent a crossover step).
              * **Step 4:** Analyzes if the right foot intersects with the Z-axis path of the left foot (crossover), while minimizing the stride length.
              * **Step 5 (Sliding):** Analyzes if the weight is fully transferred to the right foot, then the left foot slides while maintaining that force, and finally, if the weight instantaneously shifts to the left foot immediately after the release.
    3.  **Providing Results and Feedback:**
          * Derives evaluation results for each step based on the analysis criteria and provides clear **Correction Text** for areas needing improvement.
          * Helps intuitive understanding by providing visualizations that compare the user's posture with the standard posture.

-----

### **Additional Feature: Community (Chat)**

  * **Real-time WebSocket Chat based on Redis Pub/Sub:** Provides a community space where users can freely communicate and exchange information about bowling posture and other topics.

      * **Chat Room Creation and Joining Workflow**
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
      * **Message Sending Workflow**
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
