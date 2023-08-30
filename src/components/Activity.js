import React from 'react'
import { useRecords } from '@puzzlehq/sdk';

function Activity() {
    const { request, records, error, loading } = useRecords({
        filter: {
            program_id: 'rfq_v000003.aleo',
            type: 'unspent',
        },
        formatted: true
    });
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