import React, { useState, useEffect, useCallback } from "react";
import {ethers} from "ethers";
import {useProvider, useAccount, useSigner} from "wagmi";
import libraryABI from '../abi/Library.json';
import BookCard from "../components/ui/BookCard";
import Loading from "../components/ui/Loading";
import Button from "../components/ui/Button";
import NewBookForm from "../components/ui/NewBookForm"
import ErrorMsg from "../components/ui/ErrorMsg";


const Library = () => {

  const [contract, setContract] = useState();
  const [contractData, setContractData] = useState({});
  const [isLoadingContractData, setIsLoadingContractData] = useState(true);
  const [error, setError] = useState({});

  //Use public provider to get available books before user is connected
  const publicProvider = useProvider();
  const { data: signer } = useSigner();
  const { connector: activeConnector, isConnected } = useAccount();
  const contractAddress = '0x826B0a9E0Cb6af896812a4d1C4361E4106c8Ee2e';

  const initialFormData = {
    title: '',
    author: '',
    copies: 0
  };

  // Form states
  const [addBookFromData, setAddBookFormData] = useState(initialFormData);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const getReadOnlyData = useCallback(async () => {
    console.log(isConnected)
    let readOnlyContract = new ethers.Contract(contractAddress, libraryABI, publicProvider);
    let availableBooksId = await readOnlyContract.showAvailableBooks();

    let availableBooks = new Map();
    await Promise.all(availableBooksId.map(async (bookId, i) => {
      let book = await readOnlyContract.books(bookId);
      availableBooks.set(bookId, book);
    }));
    let currentBooks = new Map();
    let isOwner = false;
    setContractData({ availableBooks, currentBooks,  isOwner})
    setIsLoadingContractData(false);
  }, [publicProvider]);

  useEffect( () => {
    if(!isConnected) {
      getReadOnlyData();
    }
  }, [isConnected, publicProvider])

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
      let hasError = true;
      let error = e.reason;
      setError( {hasError, error});
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

      setIsLoadingContractData(true);
      setIsFormVisible(false);

      const tx = await contract.addBook(title, author, copies);
      await tx.wait();

      setAddBookFormData(initialFormData);

      await getContractData();
    } catch (e) {
      let hasError = true;
      let error = e.reason;
      setError( {hasError, error});
    } finally {
      setIsLoadingContractData(false);
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
      {error.hasError ? <ErrorMsg handleErrorClick={handleErrorClick} error={error} />: null}
      {isFormVisible ?
        <NewBookForm
          handleFormClick={handleFormClick}
          handleFormCloseClick={handleFormCloseClick}
          handleFormInputChange={handleFormInputChange}
          handleSubmitButtonClick={handleSubmitButtonClick}
        />: null}
      {isLoadingContractData ?
        <Loading />  : (
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
                  // Show buttons only when user is connected!!!
                  readOnly = {!signer ? true : false}
                  buttonLabel='Borrow this book'/>
                </div>
              )
          })}
          </div>

        <br/>

        {/*Dont show this section, if user is not connected*/}
        {signer ? (
          <div>
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
          ) : null }
      </div>
      )}
    </div>
  )
}

export default Library;
