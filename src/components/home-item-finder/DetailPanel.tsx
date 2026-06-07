import { useRef, useState } from 'react';
import { useHomeStore } from '#/store/useHomeStore';
import type { Drawer } from './types';

export default function DetailPanel() {
	const {
		furniture,
		detailFurnitureId,
		openDetail,
		updateFurniture,
		addDrawer,
		updateDrawer,
		deleteDrawer,
		reorderDrawers,
		addItem,
		updateItem,
		deleteItem,
	} = useHomeStore();

	const f = furniture.find((fu) => fu.id === detailFurnitureId);
	const [expandedDrawerId, setExpandedDrawerId] = useState<string | null>(null);
	const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>(
		{},
	);
	const [editingItem, setEditingItem] = useState<string | null>(null);
	const [draggingDrawer, setDraggingDrawer] = useState<string | null>(null);
	const dragOverRef = useRef<string | null>(null);

	if (!f) return null;

	const handleLabelChange = (val: string) => {
		updateFurniture(f.id, { label: val });
	};

	const handleDrawerLabelChange = (drawerId: string, val: string) => {
		updateDrawer(f.id, drawerId, val);
	};

	const handleAddItem = (drawerId: string) => {
		const name = newItemInputs[drawerId]?.trim();
		if (!name) return;
		addItem(f.id, drawerId, name);
		setNewItemInputs((prev) => ({ ...prev, [drawerId]: '' }));
	};

	const handleDragStart = (drawerId: string) => setDraggingDrawer(drawerId);

	const handleDragOver = (drawerId: string) => {
		dragOverRef.current = drawerId;
	};

	const handleDrop = () => {
		if (
			!draggingDrawer ||
			!dragOverRef.current ||
			draggingDrawer === dragOverRef.current
		) {
			setDraggingDrawer(null);
			return;
		}
		const drawers = [...f.drawers];
		const fromIdx = drawers.findIndex((d) => d.id === draggingDrawer);
		const toIdx = drawers.findIndex((d) => d.id === dragOverRef.current);
		if (fromIdx === -1 || toIdx === -1) return;
		const [moved] = drawers.splice(fromIdx, 1);
		drawers.splice(toIdx, 0, moved);
		reorderDrawers(
			f.id,
			drawers.map((d, i) => ({ ...d, order: i })),
		);
		setDraggingDrawer(null);
		dragOverRef.current = null;
	};

	const sortedDrawers = [...f.drawers].sort((a, b) => a.order - b.order);

	return (
		<div
			style={{
				width: 360,
				flexShrink: 0,
				background: '#0f172a',
				borderLeft: '1px solid #1e293b',
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			{/* Header */}
			<div
				style={{
					padding: '16px',
					borderBottom: '1px solid #1e293b',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
				}}
			>
				<input
					value={f.label}
					onChange={(e) => handleLabelChange(e.target.value)}
					style={{
						flex: 1,
						background: 'transparent',
						border: 'none',
						borderBottom: '1px solid #334155',
						color: '#f1f5f9',
						fontSize: 16,
						fontWeight: 700,
						padding: '4px 0',
						outline: 'none',
					}}
				/>
				<button
					type="button"
					onClick={() => openDetail(null)}
					style={{
						background: 'none',
						border: 'none',
						color: '#64748b',
						cursor: 'pointer',
						fontSize: 18,
						padding: 4,
					}}
				>
					✕
				</button>
			</div>

			{/* Drawer List */}
			<div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
				<div
					style={{
						fontSize: 10,
						fontWeight: 700,
						color: '#475569',
						textTransform: 'uppercase',
						letterSpacing: '0.1em',
						marginBottom: 8,
						paddingLeft: 4,
					}}
				>
					서랍 목록
				</div>

				{sortedDrawers.map((drawer) => (
					<DrawerCard
						key={drawer.id}
						drawer={drawer}
						furnitureId={f.id}
						expanded={expandedDrawerId === drawer.id}
						onToggle={() =>
							setExpandedDrawerId((id) => (id === drawer.id ? null : drawer.id))
						}
						onLabelChange={(val) => handleDrawerLabelChange(drawer.id, val)}
						onDelete={() => deleteDrawer(f.id, drawer.id)}
						newItemInput={newItemInputs[drawer.id] ?? ''}
						onNewItemChange={(val) =>
							setNewItemInputs((prev) => ({ ...prev, [drawer.id]: val }))
						}
						onAddItem={() => handleAddItem(drawer.id)}
						editingItem={editingItem}
						setEditingItem={setEditingItem}
						onUpdateItem={(itemId, updates) =>
							updateItem(f.id, drawer.id, itemId, updates)
						}
						onDeleteItem={(itemId) => deleteItem(f.id, drawer.id, itemId)}
						dragging={draggingDrawer === drawer.id}
						onDragStart={() => handleDragStart(drawer.id)}
						onDragOver={() => handleDragOver(drawer.id)}
						onDrop={handleDrop}
					/>
				))}

				<button
					type="button"
					onClick={() => addDrawer(f.id)}
					style={{
						width: '100%',
						marginTop: 8,
						padding: '10px',
						background: 'transparent',
						border: '1px dashed #334155',
						borderRadius: 8,
						color: '#64748b',
						fontSize: 12,
						cursor: 'pointer',
					}}
				>
					+ 서랍 추가
				</button>
			</div>
		</div>
	);
}

interface DrawerCardProps {
	drawer: Drawer;
	furnitureId: string;
	expanded: boolean;
	onToggle: () => void;
	onLabelChange: (val: string) => void;
	onDelete: () => void;
	newItemInput: string;
	onNewItemChange: (val: string) => void;
	onAddItem: () => void;
	editingItem: string | null;
	setEditingItem: (id: string | null) => void;
	onUpdateItem: (
		itemId: string,
		updates: { name?: string; memo?: string; tags?: string[] },
	) => void;
	onDeleteItem: (itemId: string) => void;
	dragging: boolean;
	onDragStart: () => void;
	onDragOver: () => void;
	onDrop: () => void;
}

function DrawerCard({
	drawer,
	expanded,
	onToggle,
	onLabelChange,
	onDelete,
	newItemInput,
	onNewItemChange,
	onAddItem,
	editingItem,
	setEditingItem,
	onUpdateItem,
	onDeleteItem,
	dragging,
	onDragStart,
	onDragOver,
	onDrop,
}: DrawerCardProps) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop reorder UI
		<div
			draggable
			onDragStart={onDragStart}
			onDragOver={(e) => {
				e.preventDefault();
				onDragOver();
			}}
			onDrop={onDrop}
			style={{
				marginBottom: 6,
				background: '#1e293b',
				border: `1px solid ${dragging ? '#60a5fa' : '#334155'}`,
				borderRadius: 8,
				opacity: dragging ? 0.5 : 1,
			}}
		>
			{/* Drawer Header */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					padding: '10px 12px',
					gap: 8,
				}}
			>
				<span style={{ color: '#475569', cursor: 'grab', fontSize: 14 }}>
					⠿
				</span>
				<input
					value={drawer.label}
					onChange={(e) => onLabelChange(e.target.value)}
					onClick={(e) => e.stopPropagation()}
					style={{
						flex: 1,
						background: 'transparent',
						border: 'none',
						color: '#e2e8f0',
						fontSize: 13,
						fontWeight: 600,
						outline: 'none',
					}}
				/>
				<span style={{ fontSize: 11, color: '#64748b', marginRight: 4 }}>
					{drawer.items.length}개
				</span>
				<button
					type="button"
					onClick={onToggle}
					style={{
						background: 'none',
						border: 'none',
						color: '#94a3b8',
						cursor: 'pointer',
						fontSize: 12,
					}}
				>
					{expanded ? '▲' : '▼'}
				</button>
				<button
					type="button"
					onClick={onDelete}
					style={{
						background: 'none',
						border: 'none',
						color: '#64748b',
						cursor: 'pointer',
						fontSize: 14,
					}}
				>
					✕
				</button>
			</div>

			{/* Items */}
			{expanded && (
				<div style={{ borderTop: '1px solid #334155', padding: '8px 12px' }}>
					{drawer.items.map((item) => (
						<div key={item.id} style={{ marginBottom: 6 }}>
							{editingItem === item.id ? (
								<div
									style={{
										background: '#0f172a',
										borderRadius: 6,
										padding: 10,
										border: '1px solid #334155',
									}}
								>
									<input
										value={item.name}
										onChange={(e) =>
											onUpdateItem(item.id, { name: e.target.value })
										}
										style={itemInput}
										placeholder="이름"
									/>
									<input
										value={item.memo}
										onChange={(e) =>
											onUpdateItem(item.id, { memo: e.target.value })
										}
										style={{ ...itemInput, marginTop: 6, color: '#94a3b8' }}
										placeholder="메모"
									/>
									<input
										value={item.tags.join(', ')}
										onChange={(e) =>
											onUpdateItem(item.id, {
												tags: e.target.value
													.split(',')
													.map((t) => t.trim())
													.filter(Boolean),
											})
										}
										style={{
											...itemInput,
											marginTop: 6,
											color: '#60a5fa',
											fontSize: 11,
										}}
										placeholder="태그 (쉼표로 구분)"
									/>
									<button
										type="button"
										onClick={() => setEditingItem(null)}
										style={{
											marginTop: 8,
											padding: '4px 12px',
											background: '#1e3a5f',
											border: '1px solid #60a5fa',
											borderRadius: 6,
											color: '#60a5fa',
											fontSize: 11,
											cursor: 'pointer',
										}}
									>
										완료
									</button>
								</div>
							) : (
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 6,
										borderRadius: 6,
										background: '#0f172a',
									}}
								>
									<button
										type="button"
										onClick={() => setEditingItem(item.id)}
										style={{
											flex: 1,
											background: 'none',
											border: 'none',
											textAlign: 'left',
											padding: '6px 8px',
											cursor: 'pointer',
											borderRadius: 6,
										}}
									>
										<div style={{ flex: 1 }}>
											<div style={{ fontSize: 13, color: '#e2e8f0' }}>
												{item.name}
											</div>
											{item.memo && (
												<div
													style={{
														fontSize: 11,
														color: '#64748b',
														marginTop: 2,
													}}
												>
													{item.memo}
												</div>
											)}
											{item.tags.length > 0 && (
												<div
													style={{
														display: 'flex',
														gap: 4,
														marginTop: 4,
														flexWrap: 'wrap',
													}}
												>
													{item.tags.map((tag) => (
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
										</div>
									</button>
									<button
										type="button"
										onClick={() => onDeleteItem(item.id)}
										style={{
											background: 'none',
											border: 'none',
											color: '#475569',
											cursor: 'pointer',
											fontSize: 13,
											padding: '0 8px',
										}}
									>
										✕
									</button>
								</div>
							)}
						</div>
					))}

					{/* Add Item */}
					<div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
						<input
							value={newItemInput}
							onChange={(e) => onNewItemChange(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') onAddItem();
							}}
							placeholder="아이템 이름 입력"
							style={{
								...itemInput,
								flex: 1,
								padding: '6px 10px',
								borderRadius: 6,
								border: '1px solid #334155',
							}}
						/>
						<button
							type="button"
							onClick={onAddItem}
							style={{
								padding: '6px 12px',
								background: '#1e3a5f',
								border: '1px solid #60a5fa',
								borderRadius: 6,
								color: '#60a5fa',
								fontSize: 12,
								cursor: 'pointer',
							}}
						>
							추가
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

const itemInput: React.CSSProperties = {
	width: '100%',
	background: 'transparent',
	border: 'none',
	borderBottom: '1px solid #334155',
	color: '#e2e8f0',
	fontSize: 13,
	padding: '4px 0',
	outline: 'none',
	boxSizing: 'border-box',
};
