import { Button, Message } from './styled';

interface Props {
	score: number;
	onRestart: () => void;
}

export function ResultOverlay({ score, onRestart }: Props) {
	return (
		<Message>
			<h1>임무 완료!</h1>
			<p>수집한 별: {score}개</p>
			<Button onClick={onRestart}>다시 시작</Button>
		</Message>
	);
}
