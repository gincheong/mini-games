import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
	const handLandmarkerRef = useRef<HandLandmarker | null>(null);
	const [isModelLoading, setIsModelLoading] = useState(true);

	useEffect(() => {
		async function initMediaPipe() {
			try {
				setIsModelLoading(true);
				const vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
				);
				handLandmarkerRef.current = await HandLandmarker.createFromOptions(
					vision,
					{
						baseOptions: {
							modelAssetPath:
								'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
							delegate: 'GPU',
						},
						runningMode: 'VIDEO',
						numHands: 2,
						minHandDetectionConfidence: 0.3,
						minHandPresenceConfidence: 0.3,
						minTrackingConfidence: 0.3,
					},
				);
				setIsModelLoading(false);
			} catch (error) {
				console.error('Failed to init MediaPipe:', error);
				setIsModelLoading(false);
			}
		}
		initMediaPipe();
	}, []);

	const startWebcam = useCallback(async () => {
		if (!videoRef.current) return;
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { width: 1280, height: 720 },
			});
			videoRef.current.srcObject = stream;
			await new Promise((resolve) => {
				// biome-ignore lint/style/noNonNullAssertion: 상위 조건부를 통해 값이 있음이 보장됨
				videoRef.current!.onloadedmetadata = resolve;
			});
			await videoRef.current.play();
		} catch (error) {
			console.error('Failed to access webcam:', error);
		}
	}, [videoRef]);

	return { handLandmarkerRef, isModelLoading, startWebcam };
}
