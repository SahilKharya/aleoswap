import React, { useState, useEffect } from "react";
import { Popover, Radio, Modal, message } from "antd";
import {
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import list_tokens from "../tokenList.json";
import Switch from '../asset/Swap_Button.png';
import { useRecords, useExecuteProgram } from '@puzzlehq/sdk';
import { FiSearch } from 'react-icons/fi';

function Swap(props) {
  // const list_tokens = [
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const decimals = Math.pow(10, 6)
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [balanceOne, setbalanceOne] = useState(null);
  const [balanceTwo, setbalanceTwo] = useState(null);
  // const [tokenList, setTokenList] = useState([]);
  const [tokenList, setTokenList] = useState(list_tokens);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [searchInput, setSearchInput] = useState("");

  const filteredTokens = tokenList?.filter(e =>
    e.ticker.toLowerCase().includes(searchInput.toLowerCase())
  );

  function correctJSONString(str) {
    // Wrap keys with double quotes
    str = str.replace(/(\w+):/g, "\"$1\":");
    // Wrap non-standard values with double quotes
    str = str.replace(/: ([a-z0-9_.]+)(,|\n|})/gi, ": \"$1\"$2");
    return str;
  }

  const { records } = useRecords(
    {
      program_id: 'rfq_v000003.aleo', // any deployed aleo program id
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
  if (data) {

    inputs = tokenOne.record + " " + data.quote + " " + data.signature
    // console.log(inputs)
    // inputs = "{owner:aleo1wxulzwkmyp45j73kz22lzys8xfc7g26fa90tydc0ctm34s4yqc8svsawj7.private,amount:51u128.private,token_id:234u64.private,_nonce:3190987288161617818003687883709403124823136738918543355387177333557526155508group.public} 36u64 2u128"
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
    programId: "rfq_v000003.aleo",
    functionName: 'quote_swap',
    inputs: inputs
  });

  useEffect(() => {
    fetchTokensList();
  }, [records]);
  useEffect(() => {
    if (tokenList && tokenList.length > 1) {
      setTokenOne(tokenList[0]);
      setTokenTwo(tokenList[1]);
    }
  }, [tokenList]);
  useEffect(() => {
    if (tokenOneAmount) {
      querySwapRate(tokenOneAmount * decimals, tokenOne.token_id, tokenTwo.token_id)
    }
  }, [tokenOneAmount]);

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
      let id = recordGroup[0].token_id.replace(/u64\.private/g, "");
      let rec = correctJSONString(JSON.stringify(recordGroup[0]))
        .replace(/"([^"]+)":/g, '$1:')
        .replace(/\n/g, '')
        .replace(/ /g, '').replace(/"/g, '')
      if (id === '1') {
        tokenList[0].amount = totalAmount / decimals;
        tokenList[0].record = rec;
      } else if (id === '2') {
        tokenList[1].amount = totalAmount / decimals;
        tokenList[1].record = rec;
      } else if (id === '3') {
        tokenList[2].amount = totalAmount / decimals;
        tokenList[2].record = rec;
      } else if (id === '4') {
        tokenList[3].amount = totalAmount / decimals;
        tokenList[3].record = rec;
      }
      return {
        tokenList
      };
    });

    setTokenList(tokenList);
    fetchBalance(tokenList[0]?.token_id, tokenList[1]?.token_id);
  }

  async function fetchBalance(one, two) {
    setbalanceOne(tokenList[one - 1].amount);
    setbalanceTwo(tokenList[two - 1].amount);
  }


  useEffect(() => {
    if (data) {
      console.log(data)
      let amount = data.quote.match(/amount_out:(\d+u\d+)/);
      setTokenTwoAmount(amount[1].replace(/u128/g, "") / decimals);
      inputs = tokenOne.record + " " + data.quote + " " + data.signature
    }
  }, [data]);



  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeTokenOne(e) {
    setTokenOneAmount(e.target.value);
  }

  function switchTokens() {
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
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
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
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

  function querySwapRate(amount_in, token_in, token_out) {
    // const API_URL = 'https://ftoy1oiyo6.execute-api.us-east-1.amazonaws.com/default/leoswap-maker?amount_in=1000000000&token_in=1&token_out=4';
    const market_query = `https://ftoy1oiyo6.execute-api.us-east-1.amazonaws.com/default/leoswap-maker?amount_in=${amount_in}&token_in=${token_in}&token_out=${token_out}`;

    fetch(market_query)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response error');
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        setApiError(error);
      });
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
          <div className="searchContainer">

            <FiSearch className="searchIcon" />
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="modalSearch" // Optional: for styling the search box
            />
          </div>
          {filteredTokens.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  {/* <div className="tokenName">{e.name}</div> */}
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className={loading ? 'tradeBox rotating-shadow' : 'tradeBox'}>
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
            type="number"
            value={tokenOneAmount || ''} onChange={changeTokenOne}  // Step 2: Attach event handler

          />
          <input className="inputBox" placeholder="0"
            type="number"
            value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <img src={Switch} alt="logo" className="switchArrow" />
          </div>
          <div className="asset assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <p className="balanceText balanceTextOne">Balance: {balanceOne}</p>

          <div className="asset assetTwo" onClick={() => openModal(2)} >
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
          <p className="balanceText balanceTextTwo">Balance: {balanceTwo}</p>

        </div>
        {!loading && <div className="swapButton" disabled={!isConnected} onClick={fetchDexSwap}>Swap
        </div>}
        {loading && <div className="swapButton disable_btn">Swap in Progress</div>}


      </div>
      <div className="m-t-20 ext">
        {!loading && error && <p>error executing program: {error}</p>}
        {transactionId && !loading && !error && <p>Transaction Id:<br />
          <a className="tx_link" href={`https://explorer.hamp.app/transaction?id=${transactionId}`} target="_blank" rel="noopener noreferrer">
            {transactionId}
          </a>
        </p>}
      </div>
    </>
  );
}

export default Swap;
