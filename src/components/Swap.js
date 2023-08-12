import React, { useState, useEffect } from "react";
import { Popover, Radio, Modal, message } from "antd";
import {
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import Switch from '../asset/Swap_Button.png';
import { useRecords, useExecuteProgram } from '@puzzlehq/sdk';

function Swap(props) {
  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2);
  const [tokenOneRecord, setTokenOneRecord] = useState(null);
  const [tokenTwoID, setTokenTwoID] = useState(null);
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


  const { records } = useRecords(
    {
      program_id: 'leoswapxyz_v2.aleo', // any deployed aleo program id
      type: 'unspent', // one of 'all' | 'spent' | 'unspent'
    } // optional params
  );

  const {
    execute,
    loading,
    transactionId,
    outputPrivate,
    outputRecords,
    outputPublic,
    outputConstant,
    error,
  } = useExecuteProgram({
    programId: "leoswapxyz_v2.aleo",
    functionName: 'swap_exact_in',
    // Aleo program inputs need their types specified, our program takes in 32 bit integers
    // so the inputs should look like "2i32 3i32"
    // inputs: '{owner: aleo1wxulzwkmyp45j73kz22lzys8xfc7g26fa90tydc0ctm34s4yqc8svsawj7.private, amount: 22u128.private,  token_id: 222u64.private,  _nonce: 6907203199694275432003410649292689215298215923460989556166877178358311583427group.public}  234u64  0u128'
    inputs: tokenList[0].record + " " + tokenList[1].token_id.replace('u64.private', '') + "u64 " + slippage + "u128"
  });
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



  const [processedRecords, setProcessedRecords] = useState([]);

  useEffect(() => {
    const processRecordsAsync = async () => {
      if (records) {
        // Any asynchronous operation on records here.
        // For example, fetching additional data or processing records.
        // For demonstration, I'm slicing the records array.
        console.log(records)
        const newRecords = records.slice(0, 5);  // change this to your actual async operation
        setProcessedRecords(newRecords);
      }
    };

    processRecordsAsync();
    fetchTokensList()
    fetchBalance(tokenList[0].token_id, tokenList[1].token_id)

  }, [records]);

  async function fetchTokensList() {
    console.log(records)
    const groupedByTokenId = records.reduce((acc, record, index) => {
      // Parse the plaintext to get the token_id
      const parsedPlaintext = JSON.parse(correctJSONString(record.plaintext))
      const tokenId = parsedPlaintext.token_id;
      tokenList[index].record = record.plaintext.replace(/"([^"]+)":/g, '$1:').replace(/\n/g, '').replace(/,/g, ', ').replace(/   /g, ' ');

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
    fetchTokensList()
    fetchBalance(tokenList[0].token_id, tokenList[1].token_id)
  }, [])


  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneRecord(e.target.value);
    // if (e.target.value && prices) {
    //   setTokenTwoID((e.target.value * prices.ratio).toFixed(2))
    // } else {
    //   setTokenTwoID(null);
    // }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneRecord(null);
    setTokenTwoID(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    // fetchPrices(two.token_id, one.token_id);
    fetchBalance(two.token_id, one.token_id);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i) {
    setPrices(null);
    setTokenOneRecord(null);
    setTokenTwoID(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      // fetchPrices(tokenList[i].token_id, tokenTwo.token_id)
      fetchBalance(tokenList[i].token_id, tokenTwo.token_id)

    } else {
      setTokenTwo(tokenList[i]);
      // fetchPrices(tokenOne.token_id, tokenList[i].token_id)
      fetchBalance(tokenOne.token_id, tokenList[i].token_id)

    }

    setIsOpen(false);
  }

  async function fetchDexSwap() {
    console.log("Inputs Value:")

    console.log(tokenList[0].record + " " + tokenList[1].token_id.replace('u64.private', '') + "u64 " + slippage + "u128")
    execute();
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
          <Radio.Button value={1}>1.0%</Radio.Button>
          <Radio.Button value={2}>2.0%</Radio.Button>
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
            value={tokenOneRecord}
          // onChange={changeAmount}
          // disabled={!prices}
          />
          <input className="inputBox" placeholder="0" value={tokenTwoID} />
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
        <div className="swapButton" disabled={!isConnected} onClick={fetchDexSwap}>Swap

        </div>
        
        <div>
          {error && <p>error executing program: {error}</p>}
          {loading && <p>executing program...</p>}
          {transactionId && !loading && !error && <p>Transaction Id: {transactionId}</p>}
        </div>
      </div>

    </>
  );
}

export default Swap;
