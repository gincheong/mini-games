import { Button, Message } from './styled';

interface Props {
	score: number;
	onRestart: () => void;
}

export function ResultOverlay({ score, onRestart }: Props) {
	return (
		<Message>
			<h1>게임 종료!</h1>
			<p>최종 점수: {score}</p>
			<Button onClick={onRestart}>다시 시작</Button>
		</Message>
	);
}
