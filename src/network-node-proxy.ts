import { endpoints } from "./network-node-server";
import request, { SuperAgentRequest } from "superagent";

export class NetworkNodeProxy {
    get baseUrl(): string {
        return this._baseUrl;
    }

    public constructor(private _baseUrl: string) {
    }

    public async getBlockchain(): Promise<void> {
        // endpoints.blockchainEndpoint
        throw Error("not implemented");
    }

    public async postTransaction(): Promise<void> {
        // endpoints.TransactionEndpoint
        throw Error("not implemented");
    }

    public async mine(): Promise<void> {
        // endpoints.mineEndpoint
        throw Error("not implemented");
    }

    public async registerAndBroadcastNode(): Promise<void> {
        // endpoints.registerAndBroadcastNodeEndpoint
        throw Error("not implemented");
    }

    public async registerNode(newNodeUrl: string): Promise<void> {
        request
        .post(`${this.registerNode}/${endpoints.registerNodeEndpoint}`)
        .type("json")
        .send({ newNodeUrl });
    }

    public async registerNodesBulk(networkNodesUrls: string[]): Promise<void> {
        const allNetworkNodes = [...networkNodesUrls, this.baseUrl];
        const response = await request
        .post(`${this.baseUrl}/${endpoints.registerNodesBulkEndpoint}`)
        .type("json")
        .send({ allNetworkNodes });
    }
}