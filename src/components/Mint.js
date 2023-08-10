import React, { useState } from "react";
import {
    useAccount,
    useExecuteProgram,
} from '@puzzlehq/sdk';

function Mint() {
    const [address, setAddress] = useState(null);
    const [tokenId, setTokenId] = useState(null);
    const [supply, setSupply] = useState(null);
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
        functionName: 'mint_public',
        // Aleo program inputs need their types specified, our program takes in 32 bit integers
        // so the inputs should look like "2i32 3i32"
        inputs: address + "address " + tokenId + "u64 " + supply + "u64",
    });
    const handleMint = (event) => {
        event.preventDefault();
        console.log("Work")
        console.log(address + "address " + tokenId + "u64 " + supply + "u64")
        execute();
    }
    // r0 -> address
    // r1 -> token_id
    // r2 -> supply
    // input r0 as address.public;
    // input r1 as u64.private;
    // input r2 as u64.public;
    // finalize r0 r1 r2;

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
                    value={tokenId}
                    onChange={e => setTokenId(e.target.value)}
                />
                <input className="inputBox"
                    placeholder="0"
                    value={supply}
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

export default Mint