import React from 'react';

const IncomingCallWindow = ({ onAccept, onDecline, caller }) => {
  return (
    <div className="incoming-call-window" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1px solid black', padding: '20px', backgroundColor: 'white', zIndex: 1000 }}>
      <h2>Incoming Call</h2>
      <p>{caller} is calling you!</p>
      <button onClick={onAccept}>Accept</button>
      <button onClick={onDecline}>Decline</button>
    </div>
  );
};

export default IncomingCallWindow;
