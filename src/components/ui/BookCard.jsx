import React from 'react';
import BookIcon from "../svg/BookIcon";
import Loading from "./Loading";
import { truncate } from '../../utils';

const BookCard = ({
  bookId = 'bookId',
  title = " ",
  author = " ",
  copies = 0
}) => {

  return (
    <div className="card mt-5">
      <div className="card-body">
        <p>
          <BookIcon/>
        </p>
        {/*<p>{truncate(bookId, 6).toUpperCase()}</p>*/}
        <p>Title: {title}</p>
        <p>Author: {author}</p>
        <p>Copies: {copies}</p>
      </div>
    </div>
  );
};

export default BookCard;
