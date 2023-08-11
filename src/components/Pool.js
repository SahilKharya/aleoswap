import React, { useState } from "react";
import {
    useAccount,
    useExecuteProgram,
} from '@puzzlehq/sdk';

function Pool() {
    const [address, setAddress] = useState(null);
    const [token_one, setTokenId] = useState(null);
    const [token_two, setSupply] = useState(null);
    const { isConnected } = useAccount();
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
        functionName: 'create_pool',
        // Aleo program inputs need their types specified, our program takes in 32 bit integers
        // so the inputs should look like "2i32 3i32"
        inputs:token_one + "u64 " + token_two + "u64",
    });
    const handleMint = (event) => {
        event.preventDefault();
        console.log("Work")
        console.log(token_one + "u64 " + token_two + "u64")
        execute();
    }
    // r0 -> token
    // r1 -> token
    // input r0 as u64.public;
    // input r1 as u64.public;

    function changeAddress(e) {
        setAddress(e.target.value);
    }
    return (
        <div className="tradeBox">
            <div className="tradeBoxHeader">
                <h4 className="m_v_24">Mint Token</h4>
            </div>
            <div className="inputs">
                <input className="inputBox"
                    placeholder="0"
                    value={address}
                    onChange={changeAddress}
                />
                <input className="inputBox"
                    placeholder="0"
                    value={token_one}
                    onChange={e => setTokenId(e.target.value)}
                />
                <input className="inputBox"
                    placeholder="0"
                    value={token_two}
                    onChange={e => setSupply(e.target.value)}
                />
                <div className="asset assetOne">
                    Address
                </div>
                <div className="asset assetTwo">
                    Token ID
                </div>
                <div className="asset assetThree">
                    Supply
                </div>
            </div>
            <div className="swapButton" disabled={loading || !isConnected} onClick={handleMint}>Mint</div>
            <div>
                {error && <p>error executing program: {error}</p>}
                {loading && <p>executing program...</p>}
                {transactionId && !loading && !error && <p>Transaction Id: {transactionId}</p>}
                {outputPrivate && (
                    <p>{"Result:" + outputPrivate}</p>
                )}
            </div>
        </div>
    )
}

export default Pool