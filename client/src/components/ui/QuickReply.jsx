import React from 'react';

const QuickReply = ({ text, onClick }) => {
  return (
    <button className="quick-reply" onClick={() => onClick(text)}>
      {text}
    </button>
  );
};

export default QuickReply;
