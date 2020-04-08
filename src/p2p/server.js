const WebSocket = require('ws');

// declare the peer to peer server port
const P2P_PORT = process.env.P2P_PORT || 5000;

// list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const MESSAGE_TYPES = {
    chain: 'CHAIN',
    block: 'BLOCK',
    transaction: 'TRANSACTION'
}

class P2pServer {
    constructor(blockchain, transactionPool, wallet) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        // each node is a socket connection
        this.nodes = [];
    }

    /**
     * Create a new p2p server and connections
     */
    listen() {
        // create the p2p server with port as argument
        const server = new WebSocket.Server({port: P2P_PORT});

        // event listener and a callback function for any new connection
        // on any new connection the current instance will send the current chain
        // to the newly connected peer
        server.on('connection', node => this.connectNode(node));

        // to connect to the peers that we have specified
        this.connectToPeers();

        console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
    }

    /**
     * Add the node to the nodes
     *
     * @param socket
     */
    connectNode(socket) {
        this.nodes.push(socket);
        console.log("Node connected");

        // register a message event listener to the node
        this.messageHandler(socket);
        // on new connection send the blockchain chain to the peer
        this.sendChain(socket)
    }

    /**
     * Connect to all nodes
     */
    connectToPeers() {

        //connect to each peer
        peers.forEach(peer => {

            // create a socket for each peer
            const socket = new WebSocket(peer);

            // open event listener is emitted when a connection is established
            // saving the socket in the array
            socket.on('open', () => this.connectNode(socket));

        });
    }

    /**
     * Income messages handler
     *
     * @param socket
     */
    messageHandler(socket) {
        //on recieving a message execute a callback function
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;

                case MESSAGE_TYPES.block:
                    console.log('block received')
                    if (this.blockchain.isValidBlock(data.block)) {
                        this.broadcastBlock(data.block);
                        this.transactionPool.clear();
                    }
                    break;

                case MESSAGE_TYPES.transaction:
                    if (!this.transactionPool.transactionExists(data.transaction)) {
                        this.transactionPool.addTransaction(data.transaction);
                        this.broadcastTransaction(data.transaction);
                    }
                    if (this.transactionPool.thresholdReached()) {
                        if (this.blockchain.getLeader() === this.wallet.getPublicKey()) {
                            console.log("Creating block");
                            let block = this.blockchain.createBlock(
                                this.transactionPool.transactions,
                                this.wallet
                            );
                            this.broadcastBlock(block);
                        }
                    }
                    break;
            }
        });
    }

    /**
     * Send current chain to node
     *
     * @param socket
     */
    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }

    /**
     * Sync current chain with other nodes
     */
    syncChain() {
        this.nodes.forEach(node => {
            this.sendChain(node);
        });
    }

    broadcastTransaction(transaction) {
        this.nodes.forEach(node => {
            this.sendTransaction(node, transaction);
        });
    }


    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
                type: MESSAGE_TYPES.transaction,
                transaction: transaction
            })
        );
    }

    broadcastBlock(block) {
        this.nodes.forEach(node => {
            this.sendBlock(node, block);
        });
    }

    sendBlock(socket, block) {
        socket.send(
            JSON.stringify({
                type: MESSAGE_TYPES.block,
                block: block
            })
        );
    }

}

module.exports = P2pServer;