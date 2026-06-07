import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
	return (
		<main>
			<h1>mini-games</h1>
			<Link to="/7-seconds">7-seconds</Link>
		</main>
	);
}
