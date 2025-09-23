import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Stats, Center } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

// 각 스텝의 애니메이션 구간/텍스트/속도
const stepData = {
  1: { start: 0.5, end: 1.5, text: 'Step 1: Initial step. Step forward shortly.', speed: 1.0 },
  2: { start: 1.55, end: 2.35, text: 'Step 2: Right foot forward with cross over on the left foot line.', speed: 1.0 },
  3: { start: 2.35, end: 2.75, text: 'Step 3: Long stride. Keep left foot from overlapping the right.', speed: 0.7 },
  4: { start: 2.75, end: 3.15, text: 'Step 4: Pivot step, very short with cross over.', speed: 0.7 },
  5: { start: 3.15, end: 4.5, text: 'Step 5: Shift body weight to left foot in one second.', speed: 1.0 },
};

/**
 * Model: 하나의 스텝 슬롯. active일 때만 재생하고, end에서 정지(마지막 프레임 고정) 후 onDone 호출.
 */
function StepModel({
  scene,
  animations,
  stepInfo,
  stepIndex,
  currentStepIndex,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  active = false,
  onDone,
}) {
  const group = useRef();
  const doneRef = useRef(false); // onDone 중복 호출 방지
  const completedRef = useRef(false); // 마지막 프레임 유지 여부
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, group);

  // 최초 바인딩 & active 바뀔 때마다 재설정
  useEffect(() => {
    const clipName = animations?.[0]?.name;
    const action = clipName ? actions[clipName] : undefined;
    if (!action) return;

    // 항상 구간 시작으로 이동
    action.clampWhenFinished = true; // 끝 프레임 정지 시 포즈 유지
    action.setLoop(THREE.LoopOnce, 1);
    action.time = stepInfo.start;
    action.timeScale = stepInfo.speed ?? 1;

    if (active) {
      // 새로 재생해야 하므로 초기화
      completedRef.current = false;
      doneRef.current = false;
      action.reset();
      action.time = stepInfo.start;
      action.play();
      action.paused = false;
      return;
    }

    const isFutureStep = currentStepIndex < stepIndex;
    if (isFutureStep) {
      // 아직 재생되지 않은 슬롯은 시작 포즈 유지
      completedRef.current = false;
      doneRef.current = false;
      action.reset();
      action.time = stepInfo.start;
      action.play();
      action.paused = true;
      return;
    }

    // 이미 재생을 마친 슬롯은 마지막 포즈를 잡아둔다
    const holdTime = completedRef.current ? stepInfo.end : stepInfo.start;
    action.play();
    action.paused = true;
    action.time = holdTime;
  }, [active, actions, animations, currentStepIndex, stepIndex, stepInfo]);

  // 진행 감시: end 도달 시 정지 및 콜백
  useFrame(() => {
    const clipName = animations?.[0]?.name;
    const action = clipName ? actions[clipName] : undefined;
    if (!action) return;

    if (!active) return;

    // 지정 구간만 재생되도록 강제
    if (action.time < stepInfo.start) action.time = stepInfo.start;
    if (action.time >= stepInfo.end) {
      action.time = stepInfo.end; // 마지막 프레임 고정
      action.paused = true;
      completedRef.current = true;

      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
    }
  });

  return <primitive ref={group} object={cloned} position={position} rotation={rotation} />;
}

export default function ThreeDLesson() {
  // 1~5번 슬롯 중 현재 재생 중인 스텝 인덱스(1-base). 완료되면 다음으로 이동.
  const [playingIndex, setPlayingIndex] = useState(1);
  const { scene, animations } = useGLTF('/models/seopro_girl.glb');

  // 슬롯 위치 배치(좌->우). 필요시 간격 조절
  const correctionModelRotation = Math.PI / 8
  const slots = [
    { idx: 1, pos: [-4, 0, 0], rot: [0, correctionModelRotation, 0] },
    { idx: 2, pos: [-2, 0, 0], rot: [0, correctionModelRotation, 0] },
    { idx: 3, pos: [0, 0, 0], rot: [0, correctionModelRotation, 0] },
    { idx: 4, pos: [2, 0, 0], rot: [0, correctionModelRotation, 0] },
    { idx: 5, pos: [4, 0, 0], rot: [0, correctionModelRotation, 0] },
  ];

  const handleDone = (idx) => {
    // 현재 idx를 마치면 다음 슬롯으로 진행(5에서 멈춤)
    setPlayingIndex((prev) => (prev < 5 ? prev + 1 : 5));
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 설명 텍스트(2D): 각 슬롯 아래에 고정 표시 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 14, lineHeight: 1.3 }}>
            <strong>Step {i}</strong>
            <div>{stepData[i].text}</div>
          </div>
        ))}
      </div>

      {/* 3D 뷰: 다섯 슬롯을 한 캔버스에 배치. 각 슬롯은 자기 차례에만 재생 후 마지막 프레임 고정 */}
      <div style={{ width: '100%', height: 520 }}>
        <Canvas camera={{ position: [0, 1.5, 9], fov: 45 }}>
          <Stats />
          <ambientLight intensity={1.2} />
          <directionalLight position={[3, 6, 3]} intensity={1.6} />
          <Suspense fallback={null}>
            <Center>
              {slots.map(({ idx, pos, rot }) => (
                <StepModel
                  key={idx}
                  scene={scene}
                  animations={animations}
                  stepInfo={stepData[idx]}
                  stepIndex={idx}
                  currentStepIndex={playingIndex}
                  position={pos}
                  rotation={rot}
                  active={playingIndex === idx}
                  onDone={() => handleDone(idx)}
                />
              ))}
            </Center>
          </Suspense>
          <gridHelper args={[20, 20]} />
          <OrbitControls makeDefault />
        </Canvas>
      </div>

      {/* 진행 컨트롤(옵션): 재시작/다음으로 건너뛰기 등 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setPlayingIndex(1)}>Restart sequence</button>
        <button onClick={() => setPlayingIndex((p) => Math.min(5, p + 1))}>Skip to next</button>
        <span>Now playing: Step {playingIndex}</span>
      </div>
    </div>
  );
}

useGLTF.preload('/models/seopro_girl.glb');
