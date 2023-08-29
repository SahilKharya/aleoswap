import React from 'react'
import { useRecords } from '@puzzlehq/sdk';

function Activity() {
    const { records, error, loading } = useRecords(
        {
            program_id: 'rfq_v000003.aleo', // any deployed aleo program id
            type: 'unspent', // one of 'all' | 'spent' | 'unspent'
        } // optional params
    );
    console.log(records);
    return (
        <>
            <div className="container">
                {error && <p>Error loading your records: {error}</p>}
                {loading && <p>Loading your records...</p>}
                {records && <p>Your records: {records.map((item, index) => (
                    <div key={index}>
                        <p>  {item.plaintext}</p>
                    </div>
                ))}</p>}
            </div>
        </>

    )
}

export default Activity