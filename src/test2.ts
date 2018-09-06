import { Blockchain } from "./blockchain";

const deepcopy = require("deepcopy");

const blockchain1Data = {
    "_currentNodeUrl": "http://localhost:3001",
    "_chain": [
        {
            "index": 1,
            "timestamp": "2018-09-06T13:05:05.319Z",
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "previousBlockHash": "0"
        },
        {
            "index": 2,
            "timestamp": "2018-09-06T13:05:25.473Z",
            "transactions": [
                {
                    "transactionId": "658a5c85ac384c21bddcfc27ad5a3647",
                    "amount": 1,
                    "sender": "nir",
                    "recipient": "gal"
                },
                {
                    "transactionId": "02f66483164540459f31b7f48663397b",
                    "amount": 454,
                    "sender": "nir",
                    "recipient": "omer"
                }
            ],
            "nonce": 105661,
            "hash": "0000352aa521b43d309ecbda8f6514f24aae1239feb84f546898013b676c3cd5",
            "previousBlockHash": "0"
        },
        {
            "index": 3,
            "timestamp": "2018-09-06T13:05:26.176Z",
            "transactions": [
                {
                    "transactionId": "202e02695d364a04bf8f604a8de64cbd",
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "550be0bf04244c9881d731e9e261b3e4"
                },
                {
                    "transactionId": "83a8a10b77f24ef382f48be4a8c92bb3",
                    "amount": 2000,
                    "sender": "nir",
                    "recipient": "nir"
                }
            ],
            "nonce": 16176,
            "hash": "00006a9abd6737787473f7af0ad5bbba96168f49f148df014aa46225fc9c08a4",
            "previousBlockHash": "0000352aa521b43d309ecbda8f6514f24aae1239feb84f546898013b676c3cd5"
        }
    ],
    "_pendingTransactions": [
        {
            "transactionId": "798400ea2d8a477fbad645531dc87254",
            "amount": 12.5,
            "sender": "00",
            "recipient": "a56ee892f8d44de8bb3e7c40d3697356"
        }
    ],
    "_networkNodeProxies": [
        {
            "_baseUrl": "http://localhost:3002"
        },
        {
            "_baseUrl": "http://localhost:3003"
        },
        {
            "_baseUrl": "http://localhost:3004"
        },
        {
            "_baseUrl": "http://localhost:3005"
        }
    ]
};

const blockchain2Data = { ...blockchain1Data };
blockchain2Data._chain[0].nonce == 1;

let blockchain1 = new Blockchain("");
let blockchain2 = new Blockchain("");
Object.assign(blockchain1, blockchain1Data);
Object.assign(blockchain2, blockchain2Data);
console.log(blockchain1.chainIsValid(blockchain1.chain));