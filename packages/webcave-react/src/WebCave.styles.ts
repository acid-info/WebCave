import styled from '@emotion/styled'

export const Body = styled.div`
  height: 360px;
  width: 100%;
  background: url('/webcave/background.png');
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`

export const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`

export const ItemsSelectorTableContainer = styled('div', {
  shouldForwardProp: (prop) => prop != "selectorWidthPx"
})<{ selectorWidthPx: number }>`
    position: absolute;
    top: 0;
    width: 100%;
    height: ${props => `${props.selectorWidthPx}px`};
    display: flex;
    justify-content: center;
`

export const ItemsSelectorTable = styled('table', {
  shouldForwardProp: (prop) => prop != "selectorWidthPx"
})<{ selectorWidthPx: number }>`
    background: rgba(0, 0, 0, 0.6);

    & tr {
        height: ${props => `${props.selectorWidthPx}px`};
    }

    & tr > td {
        width: ${props => `${props.selectorWidthPx}px`};
        margin: 0;
        padding: 0;
        cursor: pointer;
        opacity: 0.3;

        background: url('/webcave/blockthumbs.png') 0 0;
    }
`
