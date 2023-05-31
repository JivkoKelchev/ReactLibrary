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
    let availableBooks = [];
    await Promise.all(availableBooksId.map(async (bookId, i) => {
      let book = await contract.books(bookId);
      availableBooks.push(book);
    }));

    setContractData({ availableBooks });
    console.log(contractData.availableBooks)
    setIsLoadingContractData(false);
  }, [contract]);

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

  return(
    <div className="container my-5">
      <div className="row">
        <div className="col-8">
          <h3 className="text-headline mb-4">Available books</h3>
        {isLoadingContractData ? (
          <Loading />
        ) : (
          <div>
            { contractData.availableBooks.map((book, i) => {
              return <BookCard key={ i } title={book[0]} author={book[1]} copies={book[2].toString()}/>
          })}
          </div>
        )}
        </div>
        <div className="col-4">
          <h3 className="text-headline mb-4">My books</h3>
          <BookCard title="my book" author="teste" copies="6"/>
        </div>
      </div>
    </div>

  )
}

export default Library;
