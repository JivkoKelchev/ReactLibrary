import React from "react";
import Button from "./Button";

const NewBookForm = ({handleFormClick, handleFormCloseClick, handleFormInputChange, handleSubmitButtonClick}) => {
  return (
    <div className="form-background" onClick={handleFormCloseClick}>
      <div className="form-container" onClick={handleFormClick}>
        <h3 className="text-headline mb-4">Add new book</h3>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          className="form-control"
          name="title"
          onChange={handleFormInputChange}
        />
        <label htmlFor="author">Author:</label>
        <input
          type="text"
          className="form-control"
          name="author"
          onChange={handleFormInputChange}
        />
        <label htmlFor="title">Copies:</label>
        <input
          type="number"
          className="form-control"
          name="copies"
          onChange={handleFormInputChange}
        />
        <Button onClick={handleSubmitButtonClick}>Submit</Button>
      </div>
    </div>
  )
}

export default NewBookForm;
