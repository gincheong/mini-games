import { useEffect, useRef, useState } from 'react';
import { DEFAULT_GAME_DURATION } from './constants';
import { ResultOverlay } from './ResultOverlay';
import { StartOverlay } from './StartOverlay';
import { Canvas, GameContainer, StatBox, UIOverlay, Video } from './styled';
import { useGameLoop } from './useGameLoop';
import { useHandTracking } from './useHandTracking';

export function SpaceGame() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [gameDuration, setGameDuration] = useState(DEFAULT_GAME_DURATION);
	const [durationInput, setDurationInput] = useState(
		String(DEFAULT_GAME_DURATION),
	);

	const { handLandmarkerRef, isModelLoading, startWebcam } =
		useHandTracking(videoRef);

	const { gameState, score, timeLeft, startGame } = useGameLoop({
		gameDuration,
		canvasRef,
		videoRef,
		handLandmarkerRef,
		startWebcam,
	});

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
				<StatBox>⭐ 점수: {score}</StatBox>
				<StatBox>⏱ 남은 시간: {timeLeft}s</StatBox>
			</UIOverlay>

			{gameState === 'IDLE' && (
				<StartOverlay
					isModelLoading={isModelLoading}
					durationInput={durationInput}
					onDurationChange={setDurationInput}
					onDurationBlur={() => {
						const parsed = Math.max(
							5,
							Number(durationInput) || DEFAULT_GAME_DURATION,
						);
						setGameDuration(parsed);
						setDurationInput(String(parsed));
					}}
					onStart={startGame}
				/>
			)}

			{gameState === 'FINISHED' && (
				<ResultOverlay score={score} onRestart={startGame} />
			)}
		</GameContainer>
	);
}
