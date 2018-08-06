"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_js_1 = require("crypto-js");
var Blockchain = /** @class */ (function () {
    function Blockchain() {
        this.chain = [];
        this.pendingTransactions = [];
        this.createNewBlock(100, "0", "0");
    }
    Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
        var newBlock = {
            index: this.chain.length + 1,
            timestamp: new Date(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        };
        this.pendingTransactions = [];
        this.chain.push(newBlock);
        return newBlock;
    };
    Blockchain.prototype.getLastBlock = function () {
        return this.chain[this.chain.length - 1];
    };
    Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
        var newTransaction = {
            amount: amount,
            sender: sender,
            recipient: recipient
        };
        this.pendingTransactions.push(newTransaction);
        return this.getLastBlock().index + 1;
    };
    Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
        var dataAsString = "" + previousBlockHash + nonce + JSON.stringify(currentBlockData);
        var hash = crypto_js_1.SHA256(dataAsString);
        return hash.toString();
    };
    Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
        var nonce = -1;
        var hash = "";
        do {
            ++nonce;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        } while (hash.substring(0, 4) !== "0000");
        return nonce;
    };
    return Blockchain;
}());
exports.Blockchain = Blockchain;
