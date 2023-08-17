import React, { useState, useEffect } from "react";
import { Popover, Radio, Modal, message } from "antd";
import {
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import list_tokens from "../tokenList.json";
import Switch from '../asset/Swap_Button.png';
import { useRecords, useExecuteProgram } from '@puzzlehq/sdk';

function Swap(props) {
  // const list_tokens = [

  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2);
  const [tokenOneRecord, setTokenOneRecord] = useState(null);
  const [tokenTwoID, setTokenTwoID] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [balanceOne, setbalanceOne] = useState(null);
  const [balanceTwo, setbalanceTwo] = useState(null);
  // const [tokenList, setTokenList] = useState([]);
  const [tokenList, setTokenList] = useState(list_tokens);

  console.log(list_tokens)
  console.log(tokenList)
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);

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
  let inputs = '';
  if (tokenList && tokenList.length > 1) {
    inputs = tokenList[0].record + " " + tokenList[1].token_id.replace('u64.private', '') + "u64 " + slippage + "u128"
    // Handle slippage and other parts of the input separately if needed
    // inputs = "{owner:aleo1wxulzwkmyp45j73kz22lzys8xfc7g26fa90tydc0ctm34s4yqc8svsawj7.private,amount:51u128.private,token_id:234u64.private,_nonce:3190987288161617818003687883709403124823136738918543355387177333557526155508group.public} 36u64 2u128"
              // {owner:aleo1wxulzwkmyp45j73kz22lzys8xfc7g26fa90tydc0ctm34s4yqc8svsawj7.private,amount:22u128.private,token_id:222u64.private,_nonce:6907203199694275432003410649292689215298215923460989556166877178358311583427group.public} 234u64 2u128
  }
  
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
    inputs: inputs
  });

  useEffect(() => {
    fetchTokensList();
  }, [records]);

  async function fetchTokensList() {
    const groupedByTokenId = records.reduce((acc, record) => {
      const parsedPlaintext = JSON.parse(correctJSONString(record.plaintext));
      const tokenId = parsedPlaintext.token_id;

      if (!acc[tokenId]) {
        acc[tokenId] = [];
      }
      acc[tokenId].push(parsedPlaintext);
      return acc;
    }, {});

    const updatedTokenList = Object.values(groupedByTokenId).map((recordGroup) => {
      const totalAmount = recordGroup.reduce((sum, r) => {
        let amountVal = parseInt(r.amount.replace(/u128\.private/g, ""));
        return sum + amountVal;
      }, 0);

      return {
        amount: totalAmount,
        token_id: recordGroup[0].token_id,
        record: correctJSONString(JSON.stringify(recordGroup[0]))
          .replace(/"([^"]+)":/g, '$1:')
          .replace(/\n/g, '')
          .replace(/ /g, '').replace(/"/g, '')
      };
    });
    console.log(updatedTokenList)

    for (let i = 0; i < updatedTokenList.length; i++) {
      updatedTokenList[i].img = list_tokens[i].img;
      updatedTokenList[i].name = list_tokens[i].name;
      updatedTokenList[i].ticker = list_tokens[i].ticker;
    }
    setTokenList(updatedTokenList);

    console.log(updatedTokenList)
    console.log(tokenList)
    fetchBalance(list_tokens[0]?.token_id, list_tokens[1]?.token_id);
  }

  async function fetchBalance(one, two) {
    let bal_one = 0;
    let bal_two = 0;
    records.forEach((record) => {
      const plaintextObj = JSON.parse(correctJSONString(record.plaintext));

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

  // useEffect(() => {
  //   fetchTokensList();
  // }, []);



  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneRecord(e.target.value);
  }

  function switchTokens() {
    setTokenOneRecord(null);
    setTokenTwoID(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchBalance(two.token_id, one.token_id);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i) {
    setTokenOneRecord(null);
    setTokenTwoID(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchBalance(tokenList[i].token_id, tokenTwo.token_id)

    } else {
      setTokenTwo(tokenList[i]);
      fetchBalance(tokenOne.token_id, tokenList[i].token_id)

    }

    setIsOpen(false);
  }

  async function fetchDexSwap() {
    console.log("Inputs Value:")

    console.log(tokenList[0].record + " " + tokenList[1].token_id.replace('u64.private', '') + "u64 " + slippage + "u128")
    execute();
  }

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
