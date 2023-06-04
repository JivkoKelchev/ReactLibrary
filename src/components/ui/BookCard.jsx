import React from 'react';
import BookIcon from "../svg/BookIcon";
import Button from "./Button";
import {truncate} from '../../utils';

const BookCard = ({
                    bookId = 'bookId',
                    title = '',
                    author = '',
                    copies = '',
                    buttonLabel = '',
                    buttonHandler,
  readOnly = false
                  }) => {

  return (
    <div className="card mt-5">
      <div className="card-body">
        <div className="justify-content-center align-items-center">
          <p>
            <BookIcon/>
          </p>
          <p>{truncate(bookId, 6).toUpperCase()}</p>
          <p>Title: {title}</p>
          <p>Author: {author}</p>
          {copies !== '' ? <p>Copies: {copies}</p> : null }
          {!readOnly ?
          <Button
            onClick={buttonHandler}
            // loading={isLoadingSubmit}
            bookId = {bookId}
            type="primary"
          >
            { buttonLabel }
          </Button>
            : null }
        </div>
      </div>
    </div>
  );
};

export default BookCard;
