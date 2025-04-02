import styled from 'styled-components'

type BodyProps = {
  backgroundImage: string
  height?: string
  width?: string
}

export const Body = styled.div<BodyProps>`
  height: ${(props) => props.height || '100%'};
  width: ${(props) => props.width || '100%'};
  background: ${(props) => `url(${props.backgroundImage})`};
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`

export const Canvas = styled.canvas<{ isKicked?: boolean }>`
  width: 100%;
  height: 100%;
  opacity: ${(props) => (props.isKicked ? 0 : 1)};
`

export const ItemsSelectorTableContainer = styled.div<{
  selectorWidthPx: number
  isKicked?: boolean
}>`
  position: absolute;
  top: 0;
  width: 100%;
  height: ${({ selectorWidthPx }) => `${selectorWidthPx}px`};
  opacity: ${({ isKicked }) => (isKicked ? 0 : 1)};
  display: flex;
  justify-content: center;
`

export const ItemsSelectorTable = styled.table<{
  selectorWidthPx: number
  blockThumbsImage: string
}>`
  background: rgba(0, 0, 0, 0.6);

  & tr {
    height: ${({ selectorWidthPx }) => `${selectorWidthPx}px`};
  }

  & tr > td {
    width: ${({ selectorWidthPx }) => `${selectorWidthPx}px`};
    margin: 0;
    padding: 0;
    cursor: pointer;
    opacity: 0.3;

    background: ${({ blockThumbsImage }) => `url(${blockThumbsImage}) 0 0`};
  }
`
