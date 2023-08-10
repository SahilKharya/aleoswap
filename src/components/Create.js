import React, { useState } from "react";
import {
    useAccount,
    useExecuteProgram,
} from '@puzzlehq/sdk';

function Create() {
    const [tokenId, setTokenId] = useState(null);
    const [decimals, setDecimals] = useState(null);
    const [maxSupply, setMaxSupply] = useState(null);
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
        programId: "leoswapxyz.aleo",
        functionName: 'create_token',
        // Aleo program inputs need their types specified, our program takes in 32 bit integers
        // so the inputs should look like "2i32 3i32"
        inputs: tokenId + "u64 " + decimals + "u8 " + maxSupply + "u64",
    });

    const handleCreate = (event) => {
        event.preventDefault();
        // Read the form data
        console.log("Work")
        console.log(tokenId + "u64 " + decimals + "u8 " + maxSupply + "u64")
        execute();
    }
    // r0 -> token_id
    // r1 -> decimals
    // r2 -> max_supply
    // input r0 as u64.public;
    // input r1 as u8.public;
    // input r2 as u64.public;
    // cast r0 0u64 r2 r1 into r3 as TokenInfo;
    
    function changeTokenId(e) {
        setTokenId(e.target.value);
    }
    return (
        <div className="tradeBox">
            <div className="tradeBoxHeader">
                <h4 className="m_v_24">Create Token</h4>
            </div>
            <div className="inputs">
                <input className="inputBox"
                    placeholder="0"
                    value={tokenId}
                    onChange={changeTokenId}
                />
                <input className="inputBox"
                    placeholder="0"
                    value={decimals}
                    onChange={e => setDecimals(e.target.value)}
                />
                <input className="inputBox"
                    placeholder="0"
                    value={maxSupply}
                    onChange={e => setMaxSupply(e.target.value)}
                />
                <div className="asset assetOne">
                    Token ID
                </div>
                <div className="asset assetTwo">
                    Decimals
                </div>
                <div className="asset assetThree">
                    Max Supply
                </div>
            </div>
            <div className="swapButton" disabled={loading || !isConnected} onClick={handleCreate}>Create</div>
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

export default Create