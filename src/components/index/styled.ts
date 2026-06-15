import styled from 'styled-components';

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

export const Title = styled.h1`
  margin: 0;
  padding: 20px;

  @media (max-width: 480px) {
    font-size: 1.5rem;
    padding: 16px;
  }
`;

export const Links = styled.ul`
  display: flex;
  flex-direction: column;
  flex: 1;
  row-gap: 20px;
  list-style: disc;
  padding-left: 40px;

  @media (max-width: 480px) {
    padding-left: 28px;
    row-gap: 16px;
    font-size: 1.1rem;
  }
`;

export const Footer = styled.footer`
  display: flex;
  justify-self: flex-end;
  flex-direction: row;
  position: sticky;
  column-gap: 18px;
  bottom: 0;
  left: 0;
  padding: 16px 24px;
  border-top: 1px solid #f2f2f2;

  @media (max-width: 480px) {
    padding: 12px 16px;
    column-gap: 12px;
    font-size: 0.85rem;
    flex-wrap: wrap;
    row-gap: 6px;
  }
`;

export const Anchor = styled.a`
  all: unset;

  color: #567ace;
  cursor: pointer;

  :hover {
    text-decoration: underline;
  }
`;
