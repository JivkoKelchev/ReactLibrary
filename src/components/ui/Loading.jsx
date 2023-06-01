import React from 'react';

const Loading = () => {
  return (
    <div id='loading' className="d-flex justify-content-center align-items-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-center ms-3">Loading...</p>
    </div>
  );
}

export default Loading;
