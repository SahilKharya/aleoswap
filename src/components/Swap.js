import React, { useState, useEffect } from "react";
import { Popover, Radio, Modal, message } from "antd";
import {
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import Switch from '../asset/Swap_Button.png';
import { useRecords } from '@puzzlehq/sdk';

function Swap(props) {
  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [balanceOne, setbalanceOne] = useState(null);
  const [balanceTwo, setbalanceTwo] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
  });

  // const {data, sendTransaction} = useSendTransaction({
  //   request: {
  //     from: address,
  //     to: String(txDetails.to),
  //     data: String(txDetails.data),
  //     value: String(txDetails.value),
  //   }
  // })

  // const { isLoading, isSuccess } = useWaitForTransaction({
  //   hash: data?.hash,
  // })

  function correctJSONString(str) {
    // Wrap keys with double quotes
    str = str.replace(/(\w+):/g, "\"$1\":");

    // Wrap non-standard values with double quotes
    str = str.replace(/: ([a-z0-9_.]+)(,|\n|})/gi, ": \"$1\"$2");

    return str;
  }


  const { records, error, loading } = useRecords(
    {
      program_id: 'leoswapxyz_v2.aleo', // any deployed aleo program id
      type: 'unspent', // one of 'all' | 'spent' | 'unspent'
    } // optional params
  );

  const [processedRecords, setProcessedRecords] = useState([]);

  useEffect(() => {
    const processRecordsAsync = async () => {
      if (records) {
        // Any asynchronous operation on records here.
        // For example, fetching additional data or processing records.
        // For demonstration, I'm slicing the records array.
        const newRecords = records.slice(0, 5);  // change this to your actual async operation
        setProcessedRecords(newRecords);
      }
    };

    processRecordsAsync();
    fetchTokensList()
    fetchBalance(tokenList[0].token_id, tokenList[1].token_id)

  }, [records]);

  async function fetchTokensList() {

    const groupedByTokenId = records.reduce((acc, record) => {
      // Parse the plaintext to get the token_id
      const parsedPlaintext = JSON.parse(correctJSONString(record.plaintext))
      const tokenId = parsedPlaintext.token_id;

      // Initialize the array for the token_id if it doesn't exist
      if (!acc[tokenId]) {
        acc[tokenId] = [];
      }

      // Push the current record to the grouped array
      acc[tokenId].push(JSON.parse(correctJSONString(record.plaintext)));
      return acc;
    }, {});

    Object.values(groupedByTokenId).forEach((record, index) => {
      tokenList[index].amount = 0
      record.forEach((r, i) => {
        let amountVal = parseInt(r.amount.replace(/u128\.private/g, ""));
        tokenList[index].amount += amountVal
        tokenList[index].token_id = r.token_id
      })
    })
    console.log(tokenList)
  }

  async function fetchBalance(one, two) {
    let bal_one = 0;
    let bal_two = 0;
    console.log(one)
    console.log(two)
    records.forEach((record, index) => {
      const plaintextObj = JSON.parse(correctJSONString(record.plaintext))

      if (plaintextObj.token_id === one) {
        const amountNumber = parseInt(plaintextObj.amount.replace(/u128\.private/g, ""));
        bal_one += amountNumber;
      }
      if (plaintextObj.token_id === two) {
        const amountNumber = parseInt(plaintextObj.amount.replace(/u128\.private/g, ""));
        bal_two += amountNumber;
      }
    });
    setbalanceOne(bal_one)
    setbalanceTwo(bal_two)
  }
  useEffect(() => {
    console.log(tokenList)
    fetchTokensList()
    fetchBalance(tokenList[0].token_id, tokenList[1].token_id)

  }, [])
  //   function swap_exact_in:
  //     input r0 as Token.record;
  //     input r1 as u64.private;
  //     input r2 as u128.private;
  //     cast self.caller r0.amount r1 into r3 as Token.record;
  //     output r3 as Token.record;
  //     finalize r0.token_id r1 r2;

  // finalize swap_exact_in:
  //     input r0 as u64;
  //     input r1 as u64;
  //     input r2 as u128;
  //     contains registered_tokens[r1] into r3;
  //     assert_eq r3 true;



  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2))
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.token_id, one.token_id);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].token_id, tokenTwo.token_id)
      fetchBalance(tokenList[i].token_id, tokenTwo.token_id)

    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.token_id, tokenList[i].token_id)
      fetchBalance(tokenOne.token_id, tokenList[i].token_id)

    }

    setIsOpen(false);
  }

  async function fetchPrices(one, two) {

    const res = { 'data': '22' }


    setPrices(res.data)
  }

  async function fetchDexSwap() {

    // const allowance = await axios.get(`https://api.1inch.io/v5.0/1/approve/allowance?tokenAddress=${tokenOne.token_id}&walletAddress=${address}`)

    // if (allowance.data.allowance === "0") {

    //   const approve = await axios.get(`https://api.1inch.io/v5.0/1/approve/transaction?tokenAddress=${tokenOne.token_id}`)

    //   setTxDetails(approve.data);
    //   console.log("not approved")
    //   return

    // }

    // const tx = await axios.get(
    //   `https://api.1inch.io/v5.0/1/swap?fromTokenAddress=${tokenOne.token_id}&toTokenAddress=${tokenTwo.token_id}&amount=${tokenOneAmount.padEnd(tokenOne.decimals + tokenOneAmount.length, '0')}&fromAddress=${address}&slippage=${slippage}`
    // )

    // let decimals = Number(`1E${tokenTwo.decimals}`)
    // setTokenTwoAmount((Number(tx.data.toTokenAmount) / decimals).toFixed(2));

    // setTxDetails(tx.data.tx);

  }

  // useEffect(()=>{

  //     if(txDetails.to && isConnected){
  //       sendTransaction();
  //     }
  // }, [txDetails])

  // useEffect(()=>{

  //   messageApi.destroy();

  //   if(isLoading){
  //     messageApi.open({
  //       type: 'loading',
  //       content: 'Transaction is Pending...',
  //       duration: 0,
  //     })
  //   }    

  // },[isLoading])

  // useEffect(()=>{
  //   messageApi.destroy();
  //   if(isSuccess){
  //     messageApi.open({
  //       type: 'success',
  //       content: 'Transaction Successful',
  //       duration: 1.5,
  //     })
  //   }else if(txDetails.to){
  //     messageApi.open({
  //       type: 'error',
  //       content: 'Transaction Failed',
  //       duration: 1.50,
  //     })
  //   }


  // },[isSuccess])


  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4 className="m_v_24">Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <input className="inputBox"
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
          // disabled={!prices}
          />
          <input className="inputBox" placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <img src={Switch} alt="logo" className="switchArrow" />
          </div>
          <div className="asset assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <p className="balanceText balanceTextOne">Balance: {balanceOne}</p>

          <div className="asset assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
          <p className="balanceText balanceTextTwo">Balance: {balanceTwo}</p>

        </div>
        <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div>
        {/* <div>
          <button
            onClick={() => execute()}
            disabled={loading}
          >
            execute program
          </button>
          {error && <p>error executing program: {error}</p>}
          {loading && <p>executing program...</p>}
          {transactionId && !loading && !error && <p>Transaction Id: {transactionId}</p>}
        </div> */}
      </div>

    </>
  );
}

export default Swap;
