import type { HandLandmarker } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FINGER_MCPS, FINGER_TIPS, STAR_EMOJIS } from './constants';
import type { GameState, StarItem } from './types';

function randomStar(width: number, height: number): StarItem {
	return {
		id: Math.random(),
		x: Math.random() * width,
		y: Math.random() * height,
		vx: (Math.random() - 0.5) * 6,
		vy: (Math.random() - 0.5) * 6,
		emoji: STAR_EMOJIS[Math.floor(Math.random() * STAR_EMOJIS.length)],
		size: 36 + Math.random() * 20,
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
	const starsRef = useRef<StarItem[]>([]);
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
		starsRef.current = Array.from({ length: 20 }, () =>
			randomStar(width, height),
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
		const spaceships: { x: number; y: number; isFist: boolean }[] = [];
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
					spaceships.push({
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

		// Draw spaceships
		for (const ship of spaceships) {
			ctx.font = '90px serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(ship.isFist ? '🚀' : '🛸', ship.x, ship.y);
		}
		const hintShip = spaceships.find((s) => !s.isFist);
		if (hintShip) {
			ctx.font = 'bold 18px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#e0d0ff';
			ctx.strokeStyle = 'rgba(0,0,0,0.7)';
			ctx.lineWidth = 4;
			const label = '✊ 주먹을 쥐면 별을 수집할 수 있어요!';
			ctx.strokeText(label, hintShip.x, hintShip.y - 70);
			ctx.fillText(label, hintShip.x, hintShip.y - 70);
		}

		// Update and draw stars
		const nextStars: StarItem[] = [];
		let scoreBonus = 0;

		for (const star of starsRef.current) {
			let nx = star.x + star.vx;
			let ny = star.y + star.vy;

			if (nx < 0 || nx > canvas.width) {
				star.vx *= -1;
				nx = Math.max(0, Math.min(nx, canvas.width));
			}
			if (ny < 0 || ny > canvas.height) {
				star.vy *= -1;
				ny = Math.max(0, Math.min(ny, canvas.height));
			}

			const collected = spaceships.some(
				(ship) =>
					ship.isFist &&
					Math.sqrt((nx - ship.x) ** 2 + (ny - ship.y) ** 2) < 70,
			);

			if (collected) {
				scoreBonus += 1;
				nextStars.push(randomStar(canvas.width, canvas.height));
				continue;
			}

			ctx.font = `${star.size}px serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(star.emoji, nx, ny);
			nextStars.push({ ...star, x: nx, y: ny });
		}

		starsRef.current = nextStars;
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
