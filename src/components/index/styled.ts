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
`;

export const Links = styled.ul`
  display: flex;
  flex-direction: column;
  flex: 1;
  row-gap: 20px;  
  list-style: disc;
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
`;

export const Anchor = styled.a`
  all: unset;

  color: #567ace;
  cursor: pointer;
  
  :hover {
    text-decoration: underline;
  }
`;
