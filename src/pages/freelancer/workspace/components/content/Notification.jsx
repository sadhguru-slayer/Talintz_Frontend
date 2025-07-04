import React from 'react'
import NotificationsPanel from '../panels/NotificationPanel'

const Notification = ({isPanelMaximized}) => {
  return (
    <div className='flex flex-col h-full bg-freelancer-bg-card border border-freelancer-border shadow-card'>
        <NotificationsPanel isPanelMaximized={isPanelMaximized}/>
    </div>
  )
}

export default Notification