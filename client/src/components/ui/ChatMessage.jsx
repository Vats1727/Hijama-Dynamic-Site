import React from 'react';

const ChatMessage = ({ type, text }) => {
  return (
    <div className={`msg ${type}`}>
      <div className="msg-bubble">{text}</div>
    </div>
  );
};

export default ChatMessage;
