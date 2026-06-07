import type { HandLandmarker } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FINGER_MCPS, FINGER_TIPS, FOOD_EMOJIS } from './constants';
import type { FoodItem, GameState } from './types';

function randomFood(width: number, height: number): FoodItem {
	return {
		id: Math.random(),
		x: Math.random() * width,
		y: Math.random() * height,
		vx: (Math.random() - 0.5) * 8,
		vy: (Math.random() - 0.5) * 8,
		emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
		size: 40 + Math.random() * 20,
	};
}

interface Options {
	gameDuration: number;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	videoRef: React.RefObject<HTMLVideoElement | null>;
	handLandmarkerRef: React.RefObject<HandLandmarker | null>;
	startWebcam: () => Promise<void>;
}

export function useGameLoop({
	gameDuration,
	canvasRef,
	videoRef,
	handLandmarkerRef,
	startWebcam,
}: Options) {
	const [gameState, setGameState] = useState<GameState>('IDLE');
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(gameDuration);
	const foodsRef = useRef<FoodItem[]>([]);
	const requestRef = useRef<number>(null);

	const startGame = async () => {
		setScore(0);
		setTimeLeft(gameDuration);

		if (canvasRef.current) {
			canvasRef.current.width = window.innerWidth;
			canvasRef.current.height = window.innerHeight;
		}

		const width = window.innerWidth || 800;
		const height = window.innerHeight || 600;
		foodsRef.current = Array.from({ length: 20 }, () =>
			randomFood(width, height),
		);

		setGameState('PLAYING');
		await startWebcam();
	};

	// Timer
	useEffect(() => {
		if (gameState !== 'PLAYING' || timeLeft <= 0) return;
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

		// Detect hands
		const sharks: { x: number; y: number; isFist: boolean }[] = [];
		if (handLandmarkerRef.current && video && video.readyState >= 2) {
			try {
				const results = handLandmarkerRef.current.detectForVideo(
					video,
					performance.now(),
				);
				for (const landmarks of results.landmarks ?? []) {
					const palmX =
						FINGER_MCPS.reduce((sum, i) => sum + landmarks[i].x, 0) /
						FINGER_MCPS.length;
					const palmY =
						FINGER_MCPS.reduce((sum, i) => sum + landmarks[i].y, 0) /
						FINGER_MCPS.length;
					sharks.push({
						x: (1 - palmX) * canvas.width,
						y: palmY * canvas.height,
						isFist: FINGER_TIPS.every(
							(tip, i) => landmarks[tip].y > landmarks[FINGER_MCPS[i]].y,
						),
					});
				}
			} catch (e) {
				console.error('Detection error:', e);
			}
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw sharks
		for (const shark of sharks) {
			ctx.font = '100px serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(shark.isFist ? '🦈' : '🐬', shark.x, shark.y);
		}
		const hintShark = sharks.find((s) => !s.isFist);
		if (hintShark) {
			ctx.font = 'bold 18px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'white';
			ctx.strokeStyle = 'rgba(0,0,0,0.6)';
			ctx.lineWidth = 4;
			const label = '✊ 주먹을 쥐면 먹을 수 있어요!';
			ctx.strokeText(label, hintShark.x, hintShark.y - 70);
			ctx.fillText(label, hintShark.x, hintShark.y - 70);
		}

		// Update and draw foods
		const nextFoods: FoodItem[] = [];
		let scoreBonus = 0;

		for (const food of foodsRef.current) {
			let nx = food.x + food.vx;
			let ny = food.y + food.vy;

			if (nx < 0 || nx > canvas.width) {
				food.vx *= -1;
				nx = Math.max(0, Math.min(nx, canvas.width));
			}
			if (ny < 0 || ny > canvas.height) {
				food.vy *= -1;
				ny = Math.max(0, Math.min(ny, canvas.height));
			}

			const eaten = sharks.some(
				(shark) =>
					shark.isFist &&
					Math.sqrt((nx - shark.x) ** 2 + (ny - shark.y) ** 2) < 70,
			);

			if (eaten) {
				scoreBonus += 1;
				nextFoods.push(randomFood(canvas.width, canvas.height));
				continue;
			}

			ctx.font = `${food.size}px serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(food.emoji, nx, ny);
			nextFoods.push({ ...food, x: nx, y: ny });
		}

		foodsRef.current = nextFoods;
		if (scoreBonus > 0) setScore((s) => s + scoreBonus);

		requestRef.current = requestAnimationFrame(gameLoop);
	}, [gameState, canvasRef, videoRef, handLandmarkerRef]);

	useEffect(() => {
		if (gameState === 'PLAYING') {
			requestRef.current = requestAnimationFrame(gameLoop);
		}
		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [gameState, gameLoop]);

	return { gameState, score, timeLeft, startGame };
}
