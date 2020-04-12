const WebSocket = require('ws');

// declare the peer to peer server port
const P2P_PORT = process.env.P2P_PORT || 5000;

// list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const Transaction = require('../wallet/transaction')

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
        // handle close and error methods in connection to reach
        // all further connected nodes events
        socket.on('close', (event) => this.disconnectNode(event, socket));
        socket.on('error', (error) => this.errorOnNode(error, socket));

        console.log("Node connected");

        this.nodes.push(socket);
        // register a message event listener to the node
        this.messageHandler(socket);
        // on new connection send the blockchain chain to the peer
        this.sendChain(socket)
    }

    /**
     * Remove node from active nodes
     *
     * @param event
     * @param socket
     */
    disconnectNode(event, socket) {
        console.log("Node disconnected");
        if (event.wasClean) {
            console.log(`Socket connection was closed clean, code=${event.code} reason=${event.reason}`);
        } else {
            // server killed process or there were network error
            // mostly event.code 1006
            console.log(`Socket connection was dropped, code=${event.code}`);
        }
        this.nodes = this.nodes.filter(node => node !== socket)
    }

    /**
     * Handle node error
     *
     * @param error
     * @param socket
     */
    errorOnNode(error, socket) {
        console.log('Error on socket')
        console.log(error)
    }

    /**
     * Connect to all nodes
     */
    connectToPeers() {

        //connect to each peer
        peers.forEach(peer => {

            // create a socket for each peer
            const socket = new WebSocket(peer);

            socket.on('close', (event) => this.disconnectNode(event, socket));
            socket.on('error', (error) => this.errorOnNode(error, socket));
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
                    this.handleReceivedChain(data.chain)
                    break;

                case MESSAGE_TYPES.block:
                    this.handleReceivedBlock(data.block)
                    break;

                case MESSAGE_TYPES.transaction:
                    this.handleReceivedTransaction(data.transaction)
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

    /**
     * Send transaction to other nodes
     *
     * @param transaction
     */
    broadcastTransaction(transaction) {
        this.nodes.forEach(node => {
            this.sendTransaction(node, transaction);
        });
    }

    /**
     * Send transaction to given node
     *
     * @param socket
     * @param transaction
     */
    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
                type: MESSAGE_TYPES.transaction,
                transaction: transaction
            })
        );
    }

    /**
     * Send block to other nodes
     *
     * @param block
     */
    broadcastBlock(block) {
        this.nodes.forEach(node => {
            this.sendBlock(node, block);
        });
    }

    /**
     * Send block to given node
     *
     * @param socket
     * @param block
     */
    sendBlock(socket, block) {
        socket.send(
            JSON.stringify({
                type: MESSAGE_TYPES.block,
                block: block
            })
        );
    }

    /**
     *
     * @param chain
     */
    handleReceivedChain(chain) {
        this.blockchain.replaceChain(chain);
    }

    /**
     *
     * @param block
     */
    handleReceivedBlock(block) {
        // check if received block is not the last in chain,
        // if it's the last one, then it's already broadcasted
        if (!this.blockchain.isLastBlock(block)){
            console.log('New block received')
            if (this.blockchain.isValidBlock(block)) {
                this.blockchain.addBlock(block);
                this.broadcastBlock(block);
                this.transactionPool.clear();
            }
        }
    }

    /**
     *
     * @param transaction
     */
    handleReceivedTransaction(transaction) {
        // add and broadcast transaction if it's not exist in pool
        if (!this.transactionPool.transactionExists(transaction)) {
            let added = this.transactionPool.addTransaction(transaction);
            if (added){
                this.broadcastTransaction(transaction);
            }
        }
        // create and broadcast block if leader and threshold reached
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
    }

}

module.exports = P2pServer;