import { createFileRoute, Link } from '@tanstack/react-router';
import { Anchor, Footer, Links, Main, Title } from '#/components/index/styled';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
	return (
		<Main>
			<Title>mini-games</Title>
			<Links>
				<li>
					<Link to="/7-seconds">7초 맞히기</Link>
				</li>
				<li>
					<Link to="/shark-game">상어 게임</Link>
				</li>
			</Links>
			<Footer>
				<Anchor href="mailto:gincheong2@gmail.com">gincheong2@gmail.com</Anchor>
				<Anchor href="https://gincheong.github.io" target="_blank">
					Blog
				</Anchor>
				<Anchor
					href="https://github.com/gincheong"
					target="_blank"
					rel="noopener noreferrer"
				>
					Github
				</Anchor>
				<Anchor
					href="https://www.linkedin.com/in/gincheong2"
					target="_blank"
					rel="noopener noreferrer"
				>
					LinkedIn
				</Anchor>
			</Footer>
		</Main>
	);
}
