import React, { useState, useEffect, useCallback } from "react";
import {ethers} from "ethers";
import {useSigner} from "wagmi";
import libraryABI from '../abi/Library.json';
import BookCard from "../components/ui/BookCard";
import Loading from "../components/ui/Loading";



const Library = () => {

  const [contract, setContract] = useState();
  const [contractData, setContractData] = useState({});
  const [isLoadingContractData, setIsLoadingContractData] = useState(true);

  const { data: signer } = useSigner();
  const contractAddress = '0xf071786c9Ab0585d64b0E53d7d027B3E30310324';

  const getContractData = useCallback(async () => {
    setIsLoadingContractData(true);

    const availableBooksId = await contract.showAvailableBooks();
    let availableBooks = new Map();
    await Promise.all(availableBooksId.map(async (bookId, i) => {
      let book = await contract.books(bookId);
      availableBooks.set(bookId, book);
    }));

    let currentBooks = new Map();
    if(signer) {
      const signerAddress = await signer.getAddress();
      const currentBooksId = await contract.showUserCurrentBooks(signerAddress);
      await Promise.all(currentBooksId.map(async (bookId, i) => {
        let book = await contract.books(bookId);
        currentBooks.set(bookId, book);
      }));
   }

    setContractData({ availableBooks, currentBooks });
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
      //setFormSubmitError(e.reason);
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

  return(
    <div className="container my-5">
      <div className="row">
        <div className="col-10">
          <h3 className="text-headline mb-4">Available books</h3>
        {isLoadingContractData ? (
          <Loading />
        ) : (
          <div className="row">
            { [...contractData.availableBooks.keys()].map((key) => {
              return (
                <div key={ 'available' + key } className='col-3'>
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
        )}
        </div>
        <div className="col-2">
          <h3 className="text-headline mb-4">My books</h3>
          {isLoadingContractData ? (
            <Loading />
          ) : (
          <div className="row">
            { [...contractData.currentBooks.keys()].map((key) => {
              return (
                <div key={ key } className='col-12'>
                  <BookCard
                    bookId={key}
                    title={contractData.currentBooks.get(key)[0]}
                    author={contractData.currentBooks.get(key)[1]}
                    copies={contractData.currentBooks.get(key)[2].toString()}
                    buttonHandler = {handleReturnBookButtonClick}
                    buttonLabel='Return this book'/>
                </div>
              )
            })}
          </div>
            )}
        </div>
      </div>
    </div>

  )
}

export default Library;
