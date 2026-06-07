import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
	return (
		<main>
			<h1>mini-games</h1>
			<div style={{ display: 'flex', gap: '20px', fontSize: '1.2rem' }}>
				<Link to="/7-seconds">7-seconds</Link>
				<Link to="/shark-game">🦈 Shark Game</Link>
			</div>
		</main>
	);
}
