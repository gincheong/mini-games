import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	ActionButton,
	BestHistoryTitle,
	Container,
	HiddenTimer,
	HistoryDiff,
	HistoryGroup,
	HistoryItem,
	HistoryList,
	HistorySection,
	HistoryTime,
	HistoryTitle,
	Instruction,
	ResultText,
	TimerText,
	TimerWrapper,
	Title,
} from '@/components/7-seconds/styled';

export const Route = createFileRoute('/7-seconds')({
	component: SevenSecondsGame,
	head: () => ({
		meta: [{ title: '7 Seconds' }],
	}),
});

export type GameStatus = 'IDLE' | 'RUNNING' | 'FINISHED';

interface GameRecord {
	id: number;
	elapsedTime: number;
	diff: string;
	isClose: boolean;
}

function SevenSecondsGame() {
	const [status, setStatus] = useState<GameStatus>('IDLE');
	const [startTime, setStartTime] = useState<number | null>(null);
	const [elapsedTime, setElapsedTime] = useState(0);
	const [history, setHistory] = useState<GameRecord[]>([]);
	const timerRef = useRef<number | null>(null);

	const startTimer = () => {
		const now = Date.now();
		setStartTime(now);
		setElapsedTime(0);
		setStatus('RUNNING');
	};

	const stopTimer = () => {
		const now = Date.now();
		setStatus('FINISHED');
		if (startTime) {
			const finalTime = (now - startTime) / 1000;
			setElapsedTime(finalTime);

			const diffValue = Math.abs(7 - finalTime);
			const newRecord: GameRecord = {
				id: Date.now(),
				elapsedTime: finalTime,
				diff: diffValue.toFixed(3),
				isClose: diffValue < 0.5,
			};
			setHistory((prev) => [newRecord, ...prev]);
		}
	};

	const bestRecords = useMemo(() => {
		return [...history]
			.sort((a, b) => parseFloat(a.diff) - parseFloat(b.diff))
			.slice(0, 3);
	}, [history]);

	const recentRecords = useMemo(() => {
		return history.slice(0, 5);
	}, [history]);

	const resetGame = () => {
		setStatus('IDLE');
		setStartTime(null);
		setElapsedTime(0);
	};

	const handleAction = () => {
		if (status === 'IDLE') {
			startTimer();
		} else if (status === 'RUNNING') {
			stopTimer();
		} else {
			resetGame();
		}
	};

	useEffect(() => {
		if (status === 'RUNNING') {
			timerRef.current = window.setInterval(() => {
				if (startTime) {
					setElapsedTime((Date.now() - startTime) / 1000);
				}
			}, 10);
		} else {
			if (timerRef.current) clearInterval(timerRef.current);
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [status, startTime]);

	const diff = Math.abs(7 - elapsedTime).toFixed(3);
	const isAnswerClose = Math.abs(7 - elapsedTime) < 0.5;

	return (
		<Container>
			<Title>7.00초 세기</Title>
			<Instruction>
				{status === 'IDLE' && '시작 버튼을 누르고 마음속으로 7초를 세어보세요.'}
				{status === 'RUNNING' &&
					'정확히 7초가 되었다고 생각될 때 멈춤 버튼을 누르세요!'}
				{status === 'FINISHED' && `목표 7.00초와의 차이: ${diff}초`}
			</Instruction>

			<TimerWrapper>
				{status === 'RUNNING' ? (
					<HiddenTimer>?.??</HiddenTimer>
				) : (
					<TimerText $status={status}>{elapsedTime.toFixed(2)}</TimerText>
				)}
			</TimerWrapper>

			<ActionButton $status={status} onClick={handleAction}>
				{status === 'IDLE' && '시작'}
				{status === 'RUNNING' && '멈춤'}
				{status === 'FINISHED' && '다시 하기'}
			</ActionButton>

			{status === 'FINISHED' && (
				<ResultText $isClose={isAnswerClose}>
					{isAnswerClose
						? '대단해요! 거의 정확합니다! 🎯'
						: '조금 더 연습해볼까요? 💪'}
				</ResultText>
			)}

			{history.length > 0 && (
				<HistorySection>
					<HistoryGroup>
						<BestHistoryTitle>명예의 전당 (TOP 3)</BestHistoryTitle>
						<HistoryList>
							{bestRecords.map((record) => (
								<HistoryItem
									key={`best-${record.id}`}
									$isClose={record.isClose}
								>
									<HistoryTime>{record.elapsedTime.toFixed(2)}초</HistoryTime>
									<HistoryDiff>오차: {record.diff}초</HistoryDiff>
								</HistoryItem>
							))}
						</HistoryList>
					</HistoryGroup>

					<HistoryGroup>
						<HistoryTitle>최근 기록 (최대 5개)</HistoryTitle>
						<HistoryList>
							{recentRecords.map((record) => (
								<HistoryItem
									key={`recent-${record.id}`}
									$isClose={record.isClose}
								>
									<HistoryTime>{record.elapsedTime.toFixed(2)}초</HistoryTime>
									<HistoryDiff>오차: {record.diff}초</HistoryDiff>
								</HistoryItem>
							))}
						</HistoryList>
					</HistoryGroup>
				</HistorySection>
			)}
		</Container>
	);
}
