import React from 'react'
import RevisionPanel from '../panels/RevisionPanel'

const Revision = ({isPanelMaximized}) => {
  return (
    <div className="flex flex-col h-full bg-freelancer-bg-card border border-freelancer-border shadow-card">
    <RevisionPanel isPanelMaximized={isPanelMaximized}/>
    </div>
  )
}

export default Revision
