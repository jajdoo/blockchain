import { ITransaction, Blockchain, IBlock } from "./blockchain";
import { v4 as uuid } from 'uuid';
import { ITransactionCreateRequest } from "./network-node-server";

export class NetworkNodeController {
    private bitcoin: Blockchain;
    private nodeAddress: string;

    constructor(currentNodeUrl: string) {
        this.bitcoin = new Blockchain(currentNodeUrl);
        this.nodeAddress = uuid().split("-").join("");
    }

    public getBlockChain(): Blockchain {
        return this.bitcoin;
    }

    public PostTransaction(tx: ITransaction): number {
        const index = this.bitcoin.addTransaction(tx);
        return index;
    }

    public async transactionBroadcast(tx: ITransactionCreateRequest): Promise<number> {
        const transaction = this.bitcoin.createNewTransaction(tx.amount, tx.sender, tx.recipient);
        const index = this.bitcoin.addTransaction(transaction);
        await this.bitcoin.broadcastTransaction(transaction);
        return index;
    }

    public async mine(): Promise<IBlock> {
        const lastBlock = this.bitcoin.getLastBlock();
        const { nonce, hash } = this.bitcoin.proofOfWork(lastBlock.hash, this.bitcoin.pendingTransactions);
        const newBlock = this.bitcoin.createNewBlock(nonce, lastBlock.hash, hash);
        await this.bitcoin.broadcastBlock(newBlock);
        const reward = this.bitcoin.createNewTransaction(12.5, "00", this.nodeAddress);
        await this.bitcoin.broadcastTransaction(reward);
        return newBlock;
    }

    public tryReceiveNewBlock(newBlock: IBlock): boolean {
        return this.bitcoin.tryAddBlock(newBlock);
    }

    public async registerAndBroadcastNode(newNodeUrl: string): Promise<void> {
        await this.bitcoin.registerAndBroadcastNode(newNodeUrl);
    }

    public registerNode(newNodeUrl: string): Promise<void> {
        return this.bitcoin.registerNode(newNodeUrl);
    }

    public registerNodesBulk(allNetworkNodes: string[]): void {
        for (let nodeUrl of allNetworkNodes) {
            this.bitcoin.registerNode(nodeUrl);
        }
    }

    public concensus(): void {
        this.bitcoin.concensus();
    }
}