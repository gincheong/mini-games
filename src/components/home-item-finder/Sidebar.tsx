import { useRef, useState } from 'react';
import { useHomeStore } from '#/store/useHomeStore';
import type { FurnitureType } from './types';

const FURNITURE_BUTTONS: {
	type: FurnitureType;
	icon: string;
	label: string;
}[] = [
	{ type: 'dresser', icon: '🗄️', label: '서랍장' },
	{ type: 'wardrobe', icon: '🚪', label: '옷장' },
	{ type: 'shelf', icon: '📚', label: '선반' },
	{ type: 'custom', icon: '📦', label: '커스텀' },
];

interface SidebarProps {
	onAddRoom: () => void;
	toast: (msg: string) => void;
}

export default function Sidebar({ onAddRoom, toast }: SidebarProps) {
	const {
		rooms,
		furniture,
		selectedRoomId,
		selectedFurnitureId,
		selectRoom,
		addFurniture,
		updateRoom,
	} = useHomeStore();

	const [editingRoomName, setEditingRoomName] = useState(false);
	const prevRoomId = useRef(selectedRoomId);
	if (prevRoomId.current !== selectedRoomId) {
		prevRoomId.current = selectedRoomId;
		if (editingRoomName) setEditingRoomName(false);
	}

	const handleAddFurniture = (type: FurnitureType) => {
		if (!selectedRoomId) {
			toast('방을 먼저 선택하세요');
			return;
		}
		addFurniture(type);
	};

	const selectedFurniture = furniture.find((f) => f.id === selectedFurnitureId);
	const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

	return (
		<div
			style={{
				width: 240,
				flexShrink: 0,
				background: '#0f172a',
				borderRight: '1px solid #1e293b',
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			{/* Header */}
			<div
				style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1e293b' }}
			>
				<div
					style={{
						fontSize: 15,
						fontWeight: 700,
						color: '#f1f5f9',
						marginBottom: 2,
					}}
				>
					🏠 집안 물건 찾기
				</div>
				<div style={{ fontSize: 11, color: '#64748b' }}>
					물건 위치를 쉽게 관리하세요
				</div>
			</div>

			<div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
				{/* Room Section */}
				<Section label="방 목록">
					<button type="button" onClick={onAddRoom} style={addBtn}>
						+ 방 추가
					</button>
					{rooms.length === 0 && (
						<div
							style={{
								fontSize: 12,
								color: '#475569',
								textAlign: 'center',
								padding: '8px 0',
							}}
						>
							방이 없습니다
						</div>
					)}
					{rooms.map((room) => (
						<button
							key={room.id}
							type="button"
							onClick={() => selectRoom(room.id)}
							style={{
								...roomBtn,
								background: room.id === selectedRoomId ? '#1e3a5f' : '#1e293b',
								borderColor: room.id === selectedRoomId ? '#60a5fa' : '#334155',
								color: room.id === selectedRoomId ? '#60a5fa' : '#cbd5e1',
							}}
						>
							<span
								style={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									background: room.color.replace('0.35', '0.8'),
									display: 'inline-block',
									flexShrink: 0,
								}}
							/>
							{room.name}
						</button>
					))}
				</Section>

				{/* Furniture Section */}
				<Section label="가구 추가">
					<div
						style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}
					>
						{FURNITURE_BUTTONS.map((btn) => (
							<button
								key={btn.type}
								type="button"
								onClick={() => handleAddFurniture(btn.type)}
								style={furnitureBtn}
							>
								<span style={{ fontSize: 18 }}>{btn.icon}</span>
								<span style={{ fontSize: 11 }}>{btn.label}</span>
							</button>
						))}
					</div>
				</Section>

				{/* Selected Info */}
				{(selectedFurniture || selectedRoom) && (
					<Section label="선택 정보">
						{selectedFurniture ? (
							<div style={{ fontSize: 12, color: '#94a3b8' }}>
								<div
									style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}
								>
									{selectedFurniture.label}
								</div>
								<div>
									위치: ({Math.round(selectedFurniture.x)},{' '}
									{Math.round(selectedFurniture.y)})
								</div>
								<div>
									크기: {Math.round(selectedFurniture.width)} ×{' '}
									{Math.round(selectedFurniture.height)}
								</div>
								<div>회전: {Math.round(selectedFurniture.rotation)}°</div>
								<div style={{ marginTop: 4 }}>
									서랍 {selectedFurniture.drawers.length}개
								</div>
								<div>
									아이템{' '}
									{selectedFurniture.drawers.reduce(
										(s, d) => s + d.items.length,
										0,
									)}
									개
								</div>
							</div>
						) : selectedRoom ? (
							<div style={{ fontSize: 12, color: '#94a3b8' }}>
								{editingRoomName ? (
									<input
										// biome-ignore lint/a11y/noAutofocus: 이름 편집 시 즉시 포커스
										autoFocus
										defaultValue={selectedRoom.name}
										style={{
											width: '100%',
											background: '#0f172a',
											border: '1px solid #60a5fa',
											borderRadius: 5,
											padding: '3px 7px',
											color: '#f1f5f9',
											fontSize: 13,
											fontWeight: 600,
											marginBottom: 4,
											boxSizing: 'border-box',
										}}
										onBlur={(e) => {
											const val = e.target.value.trim();
											if (val) updateRoom(selectedRoom.id, { name: val });
											setEditingRoomName(false);
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter') e.currentTarget.blur();
											if (e.key === 'Escape') {
												setEditingRoomName(false);
											}
										}}
									/>
								) : (
									<button
										type="button"
										onClick={() => setEditingRoomName(true)}
										style={{
											display: 'block',
											width: '100%',
											background: 'none',
											border: 'none',
											padding: '3px 0',
											color: '#f1f5f9',
											fontWeight: 600,
											fontSize: 13,
											cursor: 'text',
											textAlign: 'left',
											marginBottom: 4,
										}}
										title="클릭해서 이름 편집"
									>
										{selectedRoom.name} ✏️
									</button>
								)}
								<div>
									크기: {Math.round(selectedRoom.width)} ×{' '}
									{Math.round(selectedRoom.height)}
								</div>
								<div>
									가구{' '}
									{furniture.filter((f) => f.roomId === selectedRoom.id).length}
									개
								</div>
							</div>
						) : null}
					</Section>
				)}
			</div>
		</div>
	);
}

function Section({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div style={{ marginBottom: 16 }}>
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
				{label}
			</div>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				{children}
			</div>
		</div>
	);
}

const addBtn: React.CSSProperties = {
	width: '100%',
	padding: '8px 12px',
	background: '#1e3a5f',
	border: '1px dashed #60a5fa',
	borderRadius: 8,
	color: '#60a5fa',
	fontSize: 12,
	cursor: 'pointer',
	textAlign: 'center',
};

const roomBtn: React.CSSProperties = {
	width: '100%',
	padding: '7px 10px',
	border: '1px solid',
	borderRadius: 8,
	fontSize: 12,
	cursor: 'pointer',
	textAlign: 'left',
	display: 'flex',
	alignItems: 'center',
	gap: 8,
};

const furnitureBtn: React.CSSProperties = {
	padding: '10px 8px',
	background: '#1e293b',
	border: '1px solid #334155',
	borderRadius: 8,
	color: '#cbd5e1',
	fontSize: 12,
	cursor: 'pointer',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: 4,
};
