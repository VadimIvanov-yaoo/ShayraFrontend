import React, { useEffect, useState } from 'react'
import Joyride from 'react-joyride'

const JoyribeComponent = ({ sidebarRef, runTour }) => {
  const steps = [
    {
      target: sidebarRef.current,
      content:
        'Перед началом общения укажите свой username в разделе "Профиль"',
      disableBeacon: true,
    },
  ]

  return (
    <div>
      <Joyride
        steps={steps}
        run={runTour}
        showSkipButton
        locale={{ next: 'Понял' }}
        styles={{
          options: {
            zIndex: 10000,
            backgroundColor: '#f0f0f0',
            arrowColor: '#00aaff',
            primaryColor: '#00aaff',
          },
        }}
      />
    </div>
  )
}

export default JoyribeComponent
