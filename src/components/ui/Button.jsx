import React from 'react';

const Button = ({
  type = 'primary',
  children,
  disabled = false,
  className = '',
  onClick,
  loading = false,
  loadingText,
  bookId = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${type} ${className}`}
      data-book-id = {bookId}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-3"
            role="status"
            aria-hidden="true"
          ></span>{' '}
          {loadingText ? <span>{loadingText}</span> : <span>Loading...</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
