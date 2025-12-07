import React from 'react';

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="notification">
      <div className={`notification-content notification-${notification.type}`}>
        <span>{notification.message}</span>
        <button 
          onClick={onClose}
          className="notification-close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;