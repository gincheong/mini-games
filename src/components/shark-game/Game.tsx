import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FINGER_MCPS, FINGER_TIPS } from './constants';
import {
	Button,
	Canvas,
	GameContainer,
	Message,
	StatBox,
	UIOverlay,
	Video,
} from './styled';

interface FoodItem {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	emoji: string;
	size: number;
}

const FOOD_EMOJIS = ['🐟', '🐠', '🐡', '🦐', '🦑'];
const GAME_DURATION = 30;

export default function SharkGame() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const handLandmarkerRef = useRef<HandLandmarker | null>(null);
	const requestRef = useRef<number>(null);

	const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>(
		'IDLE',
	);
	const [isModelLoading, setIsModelLoading] = useState(true);
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
	const foodsRef = useRef<FoodItem[]>([]);

	// Initialize MediaPipe
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
						numHands: 1,
					},
				);
				console.log('MediaPipe HandLandmarker initialized');
				setIsModelLoading(false);
			} catch (error) {
				console.error('Failed to init MediaPipe:', error);
				setIsModelLoading(false);
			}
		}
		initMediaPipe();
	}, []);

	// Start Webcam
	const startWebcam = useCallback(async () => {
		if (videoRef.current) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { width: 1280, height: 720 },
				});
				videoRef.current.srcObject = stream;
				await new Promise((resolve) => {
					videoRef.current!.onloadedmetadata = resolve;
				});
				await videoRef.current.play();
			} catch (error) {
				console.error('Failed to access webcam:', error);
			}
		}
	}, []);

	const startGame = async () => {
		setScore(0);
		setTimeLeft(GAME_DURATION);

		// Ensure canvas size is set
		if (canvasRef.current) {
			canvasRef.current.width = window.innerWidth;
			canvasRef.current.height = window.innerHeight;
		}

		// Initialize foods in Ref
		const initialFoods: FoodItem[] = [];
		const width = window.innerWidth || 800;
		const height = window.innerHeight || 600;

		for (let i = 0; i < 20; i++) {
			initialFoods.push({
				id: Math.random(),
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 8,
				vy: (Math.random() - 0.5) * 8,
				emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
				size: 40 + Math.random() * 20,
			});
		}
		foodsRef.current = initialFoods;

		setGameState('PLAYING');
		await startWebcam();
	};

	// Timer
	useEffect(() => {
		if (gameState === 'PLAYING' && timeLeft > 0) {
			const timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						setGameState('FINISHED');
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [gameState, timeLeft]);

	// Game Loop
	const gameLoop = useCallback(() => {
		if (gameState !== 'PLAYING') return;

		const canvas = canvasRef.current;
		const video = videoRef.current;
		if (!canvas) {
			requestRef.current = requestAnimationFrame(gameLoop);
			return;
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// 1. Detect Hand
		let currentSharkX = -100;
		let currentSharkY = -100;
		let isFist = false;

		if (
			handLandmarkerRef.current &&
			video &&
			video.readyState >= 2 // HAVE_CURRENT_DATA
		) {
			try {
				const startTimeMs = performance.now();
				const results = handLandmarkerRef.current.detectForVideo(
					video,
					startTimeMs,
				);

				if (results.landmarks && results.landmarks.length > 0) {
					const landmarks = results.landmarks[0];
					const palmX = FINGER_MCPS.reduce((sum, i) => sum + landmarks[i].x, 0) / FINGER_MCPS.length;
					const palmY = FINGER_MCPS.reduce((sum, i) => sum + landmarks[i].y, 0) / FINGER_MCPS.length;
					currentSharkX = (1 - palmX) * canvas.width;
					currentSharkY = palmY * canvas.height;
					isFist = FINGER_TIPS.every(
						(tip, i) => landmarks[tip].y > landmarks[FINGER_MCPS[i]].y,
					);
				}
			} catch (e) {
				console.error('Detection error:', e);
			}
		}

		// 2. Update and Draw
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw Shark
		if (currentSharkX > 0) {
			ctx.font = '100px serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(isFist ? '🦈' : '🐬', currentSharkX, currentSharkY);

			if (!isFist) {
				ctx.font = 'bold 18px sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = 'white';
				ctx.strokeStyle = 'rgba(0,0,0,0.6)';
				ctx.lineWidth = 4;
				const label = '✊ 주먹을 쥐면 먹을 수 있어요!';
				const labelY = currentSharkY - 70;
				ctx.strokeText(label, currentSharkX, labelY);
				ctx.fillText(label, currentSharkX, labelY);
			}
		}

		// Update and Draw Foods
		const currentFoods = foodsRef.current;
		const nextFoods: FoodItem[] = [];
		let scoreBonus = 0;

		for (const food of currentFoods) {
			let nx = food.x + food.vx;
			let ny = food.y + food.vy;

			// Bounce edges
			if (nx < 0 || nx > canvas.width) {
				food.vx *= -1;
				nx = Math.max(0, Math.min(nx, canvas.width));
			}
			if (ny < 0 || ny > canvas.height) {
				food.vy *= -1;
				ny = Math.max(0, Math.min(ny, canvas.height));
			}

			// Collision check
			const dist = Math.sqrt(
				(nx - currentSharkX) ** 2 + (ny - currentSharkY) ** 2,
			);

			if (currentSharkX > 0 && isFist && dist < 70) {
				// Ate food!
				scoreBonus += 1;
				// Respawn immediately
				nextFoods.push({
					id: Math.random(),
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					vx: (Math.random() - 0.5) * 8,
					vy: (Math.random() - 0.5) * 8,
					emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
					size: 40 + Math.random() * 20,
				});
				continue;
			}

			// Draw
			ctx.font = `${food.size}px serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(food.emoji, nx, ny);

			nextFoods.push({ ...food, x: nx, y: ny });
		}

		foodsRef.current = nextFoods;
		if (scoreBonus > 0) {
			setScore((s) => s + scoreBonus);
		}

		requestRef.current = requestAnimationFrame(gameLoop);
	}, [gameState]);

	useEffect(() => {
		if (gameState === 'PLAYING') {
			requestRef.current = requestAnimationFrame(gameLoop);
		}
		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [gameState, gameLoop]);

	// Resize Canvas
	useEffect(() => {
		const handleResize = () => {
			if (canvasRef.current) {
				canvasRef.current.width = window.innerWidth;
				canvasRef.current.height = window.innerHeight;
			}
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<GameContainer>
			<Video ref={videoRef} playsInline muted />
			<Canvas ref={canvasRef} />

			<UIOverlay>
				<StatBox>점수: {score}</StatBox>
				<StatBox>남은 시간: {timeLeft}s</StatBox>
			</UIOverlay>

			{gameState === 'IDLE' && (
				<Message>
					<h1>🦈 상어 먹이 사냥</h1>
					<p>웹캠을 이용해 손을 움직여 상어를 조종하세요!</p>
					<p>제한 시간 내에 최대한 많은 물고기를 잡으세요.</p>
					{isModelLoading ? (
						<p style={{ color: '#00aaff', fontWeight: 'bold' }}>
							🎮 게임 준비 중 (핸드 트래킹 모델 로딩)...
						</p>
					) : (
						<Button onClick={startGame}>게임 시작</Button>
					)}
				</Message>
			)}

			{gameState === 'FINISHED' && (
				<Message>
					<h1>게임 종료!</h1>
					<p>최종 점수: {score}</p>
					<Button onClick={startGame}>다시 시작</Button>
				</Message>
			)}
		</GameContainer>
	);
}
