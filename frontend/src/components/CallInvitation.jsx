import React from 'react';

const CallInvitation = ({ onAccept, onDecline, caller }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Incoming Video Call</h2>
        <p style={{ marginBottom: '16px' }}>{caller} is calling...</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={onAccept}
            style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px', borderRadius: '5px' }}
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', borderRadius: '5px' }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInvitation;
