import styled from 'styled-components';
import type { GameStatus } from '#/routes/7-seconds';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  color: #333;
  padding: 24px 20px;

  @media (max-width: 480px) {
    justify-content: flex-start;
    padding: 2rem 16px 40px;
    min-height: 100svh;
  }
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1a1a1a;

  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
  }
`;

export const Instruction = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
  min-height: 1.5rem;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
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

  @media (max-width: 480px) {
    padding: 1.5rem 2rem;
    min-width: 0;
    width: 100%;
    margin-bottom: 2rem;
  }
`;

export const TimerText = styled.div<{ $status: GameStatus }>`
  font-size: 5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.$status === 'FINISHED' ? '#2ecc71' : '#333')};
  transition: color 0.3s ease;

  @media (max-width: 480px) {
    font-size: 4rem;
  }
`;

export const HiddenTimer = styled.div`
  font-size: 5rem;
  font-weight: 800;
  color: #bdc3c7;
  letter-spacing: 4px;

  @media (max-width: 480px) {
    font-size: 4rem;
  }
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

  @media (max-width: 480px) {
    padding: 1rem 3rem;
    font-size: 1.2rem;
    width: 100%;
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

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-top: 1.5rem;
    text-align: center;
  }
`;

export const HistorySection = styled.section`
  margin-top: 3rem;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 480px) {
    margin-top: 2rem;
    gap: 1.5rem;
  }
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
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
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

  @media (max-width: 480px) {
    padding: 0.75rem 0.875rem;
  }
`;

export const HistoryTime = styled.span`
  font-weight: 700;
  font-size: 1.1rem;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const HistoryDiff = styled.span`
  font-size: 0.9rem;
  color: #666;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

export const SettingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: #555;

  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 1.25rem;
  }
`;

export const SettingInput = styled.input`
  width: 64px;
  padding: 0.3rem 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  border: 2px solid #3498db;
  border-radius: 8px;
  outline: none;
  background: white;
  color: #1a1a1a;

  &:disabled {
    border-color: #ccc;
    color: #999;
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &:focus {
    border-color: #2980b9;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }

  @media (max-width: 480px) {
    width: 56px;
    font-size: 0.95rem;
  }
`;
