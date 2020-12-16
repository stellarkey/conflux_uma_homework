const { Conflux } = require('js-conflux-sdk');

async function main() {
  // initalize a Conflux object
  const cfx = new Conflux({
    url: 'http://mainnet-jsonrpc.conflux-chain.org:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
    logger: console,
  });
  let epochStart = 7742635
  let answer = false
  for(var i = epochStart; i> 0; i--){
    const blockArray = await cfx.getBlocksByEpochNumber(i)
    for (block in blockArray) {
        let result = await cfx.getBlockByHash(blockArray[block])
        if (result['transactions'].length >=20 ) {
            answer = result['hash']
            break
        }
    }
    if (answer) break
  }
  console.log('result is ' + answer)
}

main();