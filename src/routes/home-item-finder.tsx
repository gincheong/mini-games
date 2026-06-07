import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import DetailPanel from '#/components/home-item-finder/DetailPanel';
import SearchBar from '#/components/home-item-finder/SearchBar';
import Sidebar from '#/components/home-item-finder/Sidebar';
import { useHomeStore } from '#/store/useHomeStore';

const Canvas = lazy(() => import('#/components/home-item-finder/Canvas'));

export const Route = createFileRoute('/home-item-finder')({
	component: RouteComponent,
});

function RouteComponent() {
	const canvasWrapRef = useRef<HTMLDivElement>(null);
	const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
	const [toast, setToast] = useState<string | null>(null);
	const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { detailFurnitureId, exportData, importData, clearData } =
		useHomeStore();

	const showToast = (msg: string) => {
		setToast(msg);
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => setToast(null), 2500);
	};

	useEffect(() => {
		const updateSize = () => {
			if (!canvasWrapRef.current) return;
			const { width, height } = canvasWrapRef.current.getBoundingClientRect();
			setCanvasSize({ width, height });
		};
		updateSize();
		const ro = new ResizeObserver(updateSize);
		if (canvasWrapRef.current) ro.observe(canvasWrapRef.current);
		return () => ro.disconnect();
	}, []);

	const handleAddRoom = () => {
		window.dispatchEvent(new CustomEvent('canvas:startDrawing'));
	};

	const handleImport = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (ev) => {
				try {
					const data = JSON.parse(ev.target?.result as string);
					importData(data);
					showToast('데이터를 가져왔습니다');
				} catch {
					showToast('파일을 읽을 수 없습니다');
				}
			};
			reader.readAsText(file);
		};
		input.click();
	};

	const handleClear = () => {
		if (window.confirm('모든 데이터를 초기화하시겠습니까?')) {
			clearData();
		}
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
				background: '#0f172a',
				color: '#f1f5f9',
				fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
			}}
		>
			{/* Header */}
			<div
				style={{
					height: 52,
					borderBottom: '1px solid #1e293b',
					display: 'flex',
					alignItems: 'center',
					padding: '0 16px',
					gap: 12,
					flexShrink: 0,
				}}
			>
				<SearchBar />
				<div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
					<HeaderBtn onClick={exportData}>내보내기</HeaderBtn>
					<HeaderBtn onClick={handleImport}>가져오기</HeaderBtn>
					<HeaderBtn onClick={handleClear} danger>
						초기화
					</HeaderBtn>
				</div>
			</div>

			{/* Body */}
			<div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
				<Sidebar onAddRoom={handleAddRoom} toast={showToast} />

				{/* Canvas Area */}
				<div
					ref={canvasWrapRef}
					style={{
						flex: 1,
						position: 'relative',
						overflow: 'hidden',
						background: '#111827',
					}}
				>
					<Suspense
						fallback={
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									height: '100%',
									color: '#475569',
								}}
							>
								불러오는 중...
							</div>
						}
					>
						<Canvas width={canvasSize.width} height={canvasSize.height} />
					</Suspense>
				</div>

				{detailFurnitureId && <DetailPanel />}
			</div>

			{/* Toast */}
			{toast && (
				<div
					style={{
						position: 'fixed',
						bottom: 32,
						left: '50%',
						transform: 'translateX(-50%)',
						background: '#1e293b',
						border: '1px solid #334155',
						borderRadius: 8,
						padding: '10px 20px',
						color: '#f1f5f9',
						fontSize: 13,
						zIndex: 999,
						boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
					}}
				>
					{toast}
				</div>
			)}
		</div>
	);
}

function HeaderBtn({
	children,
	onClick,
	danger,
}: {
	children: React.ReactNode;
	onClick: () => void;
	danger?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				padding: '5px 14px',
				background: danger ? '#1f1010' : '#1e293b',
				border: `1px solid ${danger ? '#7f1d1d' : '#334155'}`,
				borderRadius: 7,
				color: danger ? '#fca5a5' : '#94a3b8',
				fontSize: 12,
				cursor: 'pointer',
			}}
		>
			{children}
		</button>
	);
}
