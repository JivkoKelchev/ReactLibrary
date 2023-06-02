import React, { useState, useEffect, useCallback } from "react";
import {ethers} from "ethers";
import {useSigner} from "wagmi";
import libraryABI from '../abi/Library.json';
import BookCard from "../components/ui/BookCard";
import Loading from "../components/ui/Loading";
import Button from "../components/ui/Button";



const Library = () => {

  const [contract, setContract] = useState();
  const [contractData, setContractData] = useState({});
  const [isLoadingContractData, setIsLoadingContractData] = useState(true);
  const [error, setError] = useState({})

  const { data: signer } = useSigner();
  const contractAddress = '0xf071786c9Ab0585d64b0E53d7d027B3E30310324';

  const initialFormData = {
    title: '',
    author: '',
    copies: 0
  };

  // Form states
  const [addBookFromData, setAddBookFormData] = useState(initialFormData);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const getContractData = useCallback(async () => {
    setIsLoadingContractData(true);

    const availableBooksId = await contract.showAvailableBooks();
    let availableBooks = new Map();
    await Promise.all(availableBooksId.map(async (bookId, i) => {
      let book = await contract.books(bookId);
      availableBooks.set(bookId, book);
    }));

    let currentBooks = new Map();
    let isOwner = false;
    if(signer) {
      const signerAddress = await signer.getAddress();
      const currentBooksId = await contract.showUserCurrentBooks(signerAddress);
      await Promise.all(currentBooksId.map(async (bookId, i) => {
        let book = await contract.books(bookId);
        currentBooks.set(bookId, book);
      }));

      //check if user is owner
      const owner = await contract.owner()
      isOwner = owner === signerAddress;
   }

    setContractData({ availableBooks, currentBooks,  isOwner});
    setIsLoadingContractData(false);
  }, [contract, signer]);

  // Use effects
  useEffect(() => {
    if (signer) {
      const libraryContract = new ethers.Contract(contractAddress, libraryABI, signer);
      setContract(libraryContract);
    }
  }, [signer]);

  useEffect(() => {
    contract && getContractData();
  }, [contract, getContractData]);

  const handleBorrowBookButtonClick = async (e) => {
    setIsLoadingContractData(true);
    const bookId = e.target.dataset.bookId;
    try {
      const tx = await contract.borrowBook(bookId);
      await tx.wait();

      // const txResult = await tx.wait();
      // const { status, transactionHash } = txResult;

      await getContractData();
    } catch (e) {
      let hasError = true;
      let error = e.reason;
      setError( {hasError, error});
    } finally {
      setIsLoadingContractData(false);
    }
  };

  const handleReturnBookButtonClick = async (e) => {
    setIsLoadingContractData(true);
    const bookId = e.target.dataset.bookId;
    try {
      const tx = await contract.returnBook(bookId);
      await tx.wait();

      // const txResult = await tx.wait();
      // const { status, transactionHash } = txResult;

      await getContractData();
    } catch (e) {
      //setFormSubmitError(e.reason);
    } finally {
      setIsLoadingContractData(false);
    }
  };

  const handleFormInputChange = e => {
    const { value, name } = e.target;

    setAddBookFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitButtonClick = async () => {
    try {
      const { title, author, copies } = addBookFromData;

      const tx = await contract.addBook(title, author, copies);
      await tx.wait();

      setAddBookFormData(initialFormData);

      await getContractData();
    } catch (e) {
      setError(e.reason);
    } finally {
      setIsFormVisible(false);
    }
  };

  const handleAddBookButtonClick = () => {
    setIsFormVisible(true);
  }

  const handleErrorClick = () => {

    let hasError = false;
    let error = '';
    setError( {hasError, error});
  }

  const handleFormCloseClick = () => {
    setIsFormVisible( false);
  }

  const handleFormClick = (e) => {
    e.stopPropagation();
  }

  return(
    <div className="container my-5">
      {error.hasError ?
        <div className="error-container" onClick={handleErrorClick}>
          <div className="error-msg"> {error.error} </div>
        </div>
        : null}
      {isFormVisible ?
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
        </div>: null
      }
      {isLoadingContractData ? (
        <Loading />
      ) : (
      <div>

        <div id="add-book">
          <h3 className="text-headline mb-4">Available books</h3>
          {contractData.isOwner ? <Button onClick={handleAddBookButtonClick} type='secondary'>Add book</Button> : null}
        </div>
          <div className="shelve">
            { [...contractData.availableBooks.keys()].map((key) => {
              return (
                <div key={ 'available' + key } className='book'>
                <BookCard
                  bookId={key}
                  title={contractData.availableBooks.get(key)[0]}
                  author={contractData.availableBooks.get(key)[1]}
                  copies={contractData.availableBooks.get(key)[2].toString()}
                  buttonHandler = {handleBorrowBookButtonClick}
                  buttonLabel='Borrow this book'/>
                </div>
              )
          })}
          </div>

        <br/>

          <h3 className="text-headline mb-4">My books</h3>
          <div className="shelve">
            { [...contractData.currentBooks.keys()].map((key) => {
              return (
                <div key={ key } className='book'>
                  <BookCard
                    bookId={key}
                    title={contractData.currentBooks.get(key)[0]}
                    author={contractData.currentBooks.get(key)[1]}
                    buttonHandler = {handleReturnBookButtonClick}
                    buttonLabel='Return this book'/>
                </div>
              )
            })}
          </div>
      </div>
      )}
    </div>
  )
}

export default Library;
