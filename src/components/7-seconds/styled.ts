import styled from 'styled-components';
import type { GameStatus } from '#/routes/7-seconds';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  color: #333;
  padding: 20px;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
`;

export const Instruction = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
  height: 1.5rem;
`;

export const TimerWrapper = styled.div`
  background: #f0f2f5;
  padding: 2rem 4rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  min-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
`;

export const TimerText = styled.div<{ $status: GameStatus }>`
  font-size: 5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.$status === 'FINISHED' ? '#2ecc71' : '#333')};
  transition: color 0.3s ease;
`;

export const HiddenTimer = styled.div`
  font-size: 5rem;
  font-weight: 800;
  color: #bdc3c7;
  letter-spacing: 4px;
`;

export const ActionButton = styled.button<{ $status: GameStatus }>`
  padding: 1.2rem 4rem;
  font-size: 1.5rem;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  background-color: ${(props) => {
		if (props.$status === 'IDLE') return '#3498db';
		if (props.$status === 'RUNNING') return '#e74c3c';
		return '#2c3e50';
	}};
  color: white;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ResultText = styled.div<{ $isClose: boolean }>`
  margin-top: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${(props) => (props.$isClose ? '#27ae60' : '#e67e22')};
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const HistorySection = styled.section`
  margin-top: 3rem;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const HistoryGroup = styled.div`
  width: 100%;
`;

export const HistoryTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background: #3498db;
    border-radius: 2px;
  }
`;

export const BestHistoryTitle = styled(HistoryTitle)`
  &::before {
    background: #f1c40f;
  }
`;

export const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const HistoryItem = styled.li<{ $isClose: boolean }>`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-left: 5px solid ${(props) => (props.$isClose ? '#2ecc71' : '#e67e22')};
`;

export const HistoryTime = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
`;

export const HistoryDiff = styled.span`
  font-size: 0.9rem;
  color: #666;
`;
