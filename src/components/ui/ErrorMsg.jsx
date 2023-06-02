import React from "react";

const ErrorMsg = ({handleErrorClick, error}) => {
  return (
    <div className="error-container" onClick={handleErrorClick}>
      <div className="error-msg"> {error.error} </div>
    </div>
  )
}

export default ErrorMsg;
