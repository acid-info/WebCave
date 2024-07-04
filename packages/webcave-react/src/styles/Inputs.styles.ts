import styled from '@emotion/styled'

export const ChatContainer = styled.div<{isChatOpen: boolean}>`
    position: absolute;
    left: 20px;
    bottom: 18px;
    opacity: ${props => props.isChatOpen ? '1' : '0'};
    height: ${props => props.isChatOpen ? 'initial' : '0'};
    overflow: hidden;
`

export const ChatBox = styled.div`
    width: 600px;
    height: 195px;
    overflow: hidden;
    overflow-y: scroll;
    padding-left: 10px;
    padding-right: 10px;
    cursor: default;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    display: flex;
    align-content: start;
    justify-content: start;
    margin-bottom: 10px;
`

export const ChatBoxText = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: start;
`

export const ChatBoxEntry = styled.input`
    width: 610px;
    height: 30px;
    padding-left: 10px;
    padding-bottom: 2px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    outline: none;
    color: white;
    font-size: 16px;
`

export const Nickname = styled.div`
    position: absolute;
    top: 40%;
    left: 40%;
    width: 300px;
    cursor: default;
    color: #fff;
`

export const NicknameEntry = styled.input`
    width: 100%;
    background: none;
    border: none;
    border-bottom: 1px solid #888;
    outline: none;
    color: white;
    font-size: 24px;
`

export const JoinInfo = styled.div`
    position: absolute;
    top: 42%;
    width: 99%;
    cursor: default;
    text-align: center;
    color: #fff;
    font-size: 24px;
`
