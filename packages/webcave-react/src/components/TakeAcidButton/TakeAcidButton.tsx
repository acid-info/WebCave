import React, { MouseEventHandler, useEffect, useState } from 'react'
import AcidLogo from '../../assets/acid-logo.png'
import { TakeAcidButtonProps } from './TakeAcidButton.types'
import { StyledTakeAcidButton } from './TakeAcidButton.styles'
import { getPerspectiveValues } from '../../utils/acid'

const TakeAcidButton: React.FC<TakeAcidButtonProps> = (props) => {
  const {
    renderer
  } = props;

  const [acid, setAcid] = useState(false)

  useEffect(() => {
    if (renderer) {
      renderer.setPerspective(...getPerspectiveValues(acid))
    }
  }, [acid, renderer])

  const onClickHandler: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.currentTarget.blur()
    setAcid(prev => !prev)
  }

  return (
    <StyledTakeAcidButton onClick={onClickHandler}>
      take some
      <img
        alt={"Take Acid"}
        src={AcidLogo}
      />
    </StyledTakeAcidButton>
  )
}

export default TakeAcidButton;