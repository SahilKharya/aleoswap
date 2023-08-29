import React, { useState, useEffect } from "react";
import {
    useAccount,
    useRecords,
    useExecuteProgram,
} from '@puzzlehq/sdk';
import { Modal } from "antd";
import list_tokens from "../tokenList.json";
import {
    DownOutlined
} from "@ant-design/icons";
import { FiSearch } from 'react-icons/fi';

function Mint() {
    const [address, setAddress] = useState(null);
    const [tokenId, setTokenId] = useState(1);
    const [supply, setSupply] = useState(0);
    const { account, accounts, isConnected } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    const [changeToken, setChangeToken] = useState(1);
    const [tokenList, setTokenList] = useState(list_tokens);
    const [tokenOne, setTokenOne] = useState(tokenList[0]);
    const [balanceOne, setbalanceOne] = useState(null);
    const decimals = Math.pow(10, 6)
    const [searchInput, setSearchInput] = useState("");

    const filteredTokens = tokenList?.filter(e =>
        e.ticker.toLowerCase().includes(searchInput.toLowerCase())
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
        programId: "rfq_v000003.aleo",
        functionName: 'mint_private',
        // Aleo program inputs need their types specified, our program takes in 32 bit integers
        // so the inputs should look like "2i32 3i32"
        inputs: address + " " + tokenId + "u64 " + (supply * decimals) + "u128",
    });
    const handleMint = (event) => {
        event.preventDefault();
        console.log("Work")
        console.log(address + " " + tokenId + "u64 " + (supply * decimals) + "u128")
        execute();
    }
    // r0 -> address
    // r1 -> token_id
    // r2 -> supply
    // input r0 as address.private;
    // input r1 as u64.private;
    // input r2 as u128.private;
    // cast r0 r2 r1 into r3 as Token.record;
    // output r3 as Token.record;
    // finalize r1;
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
    useEffect(() => {
        setTokenId(tokenOne.token_id)
    }, [tokenOne]);
    useEffect(() => {
        console.log(tokenId); // Logs the updated value after the component re-renders
    }, [tokenId]);
    useEffect(() => {
        fetchTokensList();
    }, [records]);
    useEffect(() => {
    }, [tokenList]);
    // function changeAddress(e) {
    //     setAddress(e.target.value);
    // }
    function openModal(asset) {
        setChangeToken(asset);
        setIsOpen(true);
    }
    function modifyToken(i) {
        setSupply(0);
        setTokenOne(tokenList[i]);
        fetchBalance(tokenList[i].token_id)
        setIsOpen(false);
    }
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
        fetchBalance(tokenList[0]?.token_id);
    }
    async function fetchBalance(one) {
        setAddress(account.address);
        setbalanceOne(tokenList[one - 1].amount);
    }
    return (
        <>
            <Modal
                open={isOpen}
                footer={null}
                onCancel={() => setIsOpen(false)}
                title="Choose token"
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
                                <img src={e.img} alt={e.ticker} className="tokenTickerLogo" />
                                <div className="tokenNameDiv">
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
                    <h4 className="m_v_24">Mint Token</h4>
                </div>
                <div className="inputs">
                    <input className="inputBox"
                        placeholder="0"
                        value={supply}
                        type="number"
                        onChange={e => setSupply(e.target.value)}
                    />
                    <div className="asset assetOne" onClick={() => openModal(1)}>
                        <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
                        {tokenOne.ticker}
                        <DownOutlined />
                    </div>
                    <p className="balanceText balanceTextOne">Balance: {balanceOne}</p>

                </div>
                {/* <div className="swapButton" disabled={loading || !isConnected} onClick={handleMint}>Mint</div> */}
                {!loading && <div className="swapButton" disabled={!isConnected} onClick={handleMint}>Mint</div>}
                {loading && <div className="swapButton disable_btn">Minting in Progress</div>}

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
    )
}

export default Mint