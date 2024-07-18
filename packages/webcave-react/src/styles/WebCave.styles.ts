import styled from "@emotion/styled"

type BodyProps = {
  backgroundImage: string
}

export const Body = styled.div<BodyProps>`
  height: 560px;
  width: 100%;
  background: ${props => `url(${props.backgroundImage})`};
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`

export const Canvas = styled.canvas<{isKicked?: boolean}>`
  width: 100%;
  height: 100%;
  opacity: ${props => props.isKicked ? 0 : 1};
`

export const ItemsSelectorTableContainer = styled('div', {
  shouldForwardProp: (prop) => prop != "selectorWidthPx" && prop != "isKicked"
})<{ selectorWidthPx: number, isKicked?: boolean }>`
    position: absolute;
    top: 0;
    width: 100%;
    height: ${props => `${props.selectorWidthPx}px`};
    opacity: ${props => props.isKicked ? 0 : 1};
    display: flex;
    justify-content: center;
`

type ItemSelectorTableProps = {
  selectorWidthPx: number
  blockThumbsImage: string
}

export const ItemsSelectorTable = styled('table', {
  shouldForwardProp: (prop) => prop != "selectorWidthPx"
})<ItemSelectorTableProps>`
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

        background: ${props => `url(${props.blockThumbsImage}) 0 0`};
    }
`
