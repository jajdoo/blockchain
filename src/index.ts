import { getNetworkNodeServer } from "./network-node-server";

const port = parseInt(process.argv[2]);
const thisUrl = process.argv[3];

const server = getNetworkNodeServer(thisUrl);

server.listen(port, function () {
    console.log(`listening on ${port}`)
});

