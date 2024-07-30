import styled from '@emotion/styled'

export const StyledTakeAcidButton = styled.button`
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 10px;
    background: none;
    width: 130px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: right;
    opacity: 0.5;
    padding: 0;
    text-align: right;

    &:hover {
        color: black;
        border-color: black;

        img {
            filter: invert(100%);
        }
    }

    img {
        height: 100%;
    }
`