import React, { createContext } from 'react';
import {useContext} from 'react';
import {useState} from 'react';
import {useEffect} from 'react';
import axios from 'axios';
import { CoinList } from './config/api';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './Pages/fireBase';
import { doc, onSnapshot } from "firebase/firestore";


const Crypto = createContext();
const CryptoContext = ({children}) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("INR");
  const  [symbol, setSymbol] = useState("₹");
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [alert, setAlert] = useState({
    open:false,
    message:"",
    type:"success",
  });
  useEffect(() => {
    if(user){
      const coinRef = doc(db, "watchlist", user.uid);
      var unsubscribe = onSnapshot(coinRef, coin =>{
        if(coin.exists()){
          setWatchlist(coin.data().coins)
        }
        else{
          console.log("No items in the Watchlist")
        }
      });
      return () => {
        unsubscribe();
      }
    }
   
  }, [user]);

  useEffect(() => {
    onAuthStateChanged(auth, user =>{
      if(user)setUser(user);
      else setUser(null)
      console.log(user)
    })
  }, []);

  const fetchCoins = async () => {
    setLoading(true);
    const { data } = await axios.get(CoinList(currency));
    console.log(data);

    setCoins(data);
    setLoading(false);
  };

  useEffect(() => {
    if(currency == "INR") setSymbol("₹");
    else if (currency == "USD") setSymbol("$");
  }, [currency]);
  return <Crypto.Provider value={{currency, symbol, setCurrency, coins, loading, fetchCoins, alert, setAlert, user, watchlist}}>{children}</Crypto.Provider>
}

export default CryptoContext;
export const CryptoState = () => {
  return useContext(Crypto);
}