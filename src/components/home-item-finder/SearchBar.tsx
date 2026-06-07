import { useRef, useState } from 'react';
import { useHomeStore } from '#/store/useHomeStore';

export default function SearchBar() {
	const {
		searchQuery,
		setSearchQuery,
		getSearchResults,
		selectRoom,
		selectFurniture,
		openDetail,
	} = useHomeStore();
	const [open, setOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const results = open && searchQuery ? getSearchResults() : [];

	const handleSelect = (furnitureId: string, roomId: string) => {
		selectRoom(roomId);
		selectFurniture(furnitureId);
		openDetail(furnitureId);
		setOpen(false);
		setSearchQuery('');
	};

	return (
		<div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					background: '#1e293b',
					border: `1px solid ${open ? '#60a5fa' : '#334155'}`,
					borderRadius: 8,
					padding: '6px 12px',
					gap: 8,
				}}
			>
				<span style={{ color: '#64748b', fontSize: 14 }}>🔍</span>
				<input
					ref={inputRef}
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					onBlur={() => setTimeout(() => setOpen(false), 150)}
					placeholder="아이템 검색 (이름, 메모, 태그)"
					style={{
						flex: 1,
						background: 'transparent',
						border: 'none',
						outline: 'none',
						color: '#f1f5f9',
						fontSize: 13,
					}}
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => {
							setSearchQuery('');
							setOpen(false);
						}}
						style={{
							background: 'none',
							border: 'none',
							color: '#64748b',
							cursor: 'pointer',
						}}
					>
						✕
					</button>
				)}
			</div>

			{open && searchQuery && (
				<div
					style={{
						position: 'absolute',
						top: 'calc(100% + 8px)',
						left: 0,
						right: 0,
						background: '#1e293b',
						border: '1px solid #334155',
						borderRadius: 10,
						zIndex: 200,
						maxHeight: 360,
						overflowY: 'auto',
						boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
					}}
				>
					{results.length === 0 ? (
						<div
							style={{
								padding: '32px 16px',
								textAlign: 'center',
								color: '#475569',
							}}
						>
							<div style={{ fontSize: 32, marginBottom: 8 }}>🤷</div>
							<div style={{ fontSize: 13 }}>찾을 수 없어요</div>
						</div>
					) : (
						results.map((r) => (
							<button
								key={r.item.id}
								type="button"
								onMouseDown={() => handleSelect(r.furniture.id, r.room.id)}
								style={{
									width: '100%',
									padding: '12px 16px',
									background: 'none',
									border: 'none',
									borderBottom: '1px solid #0f172a',
									cursor: 'pointer',
									textAlign: 'left',
									display: 'block',
								}}
							>
								<div
									style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}
								>
									{highlight(r.item.name, searchQuery)}
								</div>
								<div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
									{r.room.name} → {r.furniture.label} → {r.drawer.label}
								</div>
								{r.item.memo && (
									<div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
										{highlight(r.item.memo, searchQuery)}
									</div>
								)}
								{r.item.tags.length > 0 && (
									<div
										style={{
											display: 'flex',
											gap: 4,
											marginTop: 4,
											flexWrap: 'wrap',
										}}
									>
										{r.item.tags.map((tag) => (
											<span
												key={tag}
												style={{
													fontSize: 10,
													padding: '1px 6px',
													background: '#1e3a5f',
													color: '#60a5fa',
													borderRadius: 4,
												}}
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</button>
						))
					)}
				</div>
			)}
		</div>
	);
}

function highlight(text: string, query: string): React.ReactNode {
	const idx = text.toLowerCase().indexOf(query.toLowerCase());
	if (idx === -1) return text;
	return (
		<>
			{text.slice(0, idx)}
			<mark
				style={{
					background: '#fbbf24',
					color: '#0f172a',
					borderRadius: 2,
					padding: '0 1px',
				}}
			>
				{text.slice(idx, idx + query.length)}
			</mark>
			{text.slice(idx + query.length)}
		</>
	);
}
