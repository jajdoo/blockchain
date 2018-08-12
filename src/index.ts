import { getServer } from "./networkNode";

const port = parseInt(process.argv[2]);
const thisUrl = process.argv[3];

const server = getServer(thisUrl);

server.listen(port, function () {
    console.log(`listening on ${port}`)
});

