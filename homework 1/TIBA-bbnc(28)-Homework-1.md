# Homework of Lecture 3

> [Lecture 3 - Homework & Resources](https://forum.conflux.fun/t/topic/2910)

## transaction classification

1)On which network is this transaction? `0xb97e091e42252571072ae9c605bda16c8f2568cb6a4ff8fd717d384123074b55`

> Conflux now have a test network(**Conflux Testnet**) , and a pre-mainnet network(**Conflux Oceanus**).
>
> But none of those networks have the requested transaction.

## block match search

2)Find a block with 20 or more transactions and send us the block hash.

> 0x618f924e1f6c7eab371551d8a5e407aeecd9a192bdd130204dc1ccc42566360f
>
> > note: this block is from the **Conflux Testnet**,and contains **280** transactions.
>
> ![block](TIBA-bbnc(28)-Homework-1/image-20201008022034530-1602138354035.png)
>
> And there is a JS code to automatically find a block with 20 or more transactions:

```js
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
```

> By running it, we can find the results: `0x273d13668462ae7cbb14f25fea0eb8bdbac2dfcd4571a3c5139f08a864d160ba`
>
> > note: this block is from the **Conflux Oceanus**,and contains **22** transactions.
>
> ![0x273d13668462ae7cbb14f25fea0eb8bdbac2dfcd4571a3c5139f08a864d160ba](TIBA-bbnc(28)-Homework-1/image-20201008110908510-1602138354035.png)
>
> Here is the running test:
>
> ![ running test](TIBA-bbnc(28)-Homework-1/image-20201008114435446-1602138354036.png)

## failed transaction

3)Try to find a failed transaction. Did the sender retry?

> ![failed transactions](TIBA-bbnc(28)-Homework-1/image-20201008014307350-1602138354036.png)
>
> > *Failed First try:***0x6151cf6ceb0d2156e6f35c258d94e27ebc299d149ee664544db343c8e5d29520**
> >
> > *Failed Second try:* **0x7635749799dafce791bb952d7a83859c1c4faca8f6cb3d2652fabb073a992241**
> >
> > *Successful Third try:*
> >
> > **0x6151cf6ceb0d2156e6f35c258d94e27ebc299d149ee664544db343c8e5d29520**
>
> Doing smart contract actually also has failed several transactions...
>
> ![failed transaction](TIBA-bbnc(28)-Homework-1/image-20201008013717131-1602138354036.png)

## CFX faucet test

4)Create a wallet, get some CFX **through the faucet** and send us the corresponding transactions hash.

```
{"code":0,"message":{"tx":"0x0163755fe87b34053d2f949ba757b23f3fdbff47ac73b3b0af3e8fb2cabba2d4"}}
```

> Use "Deposit" button to get free CFX~~
>
> 0x0163755fe87b34053d2f949ba757b23f3fdbff47ac73b3b0af3e8fb2cabba2d4

## buy a ticket

5)Buy a ticket on 167.172.160.61 and send us the corresponding transaction hash.
5.1)What happens if you lower the gas limit before sending the transaction?
5.2)What happens if you try to buy a second ticket for the same address?

> 5）0xbc6e65773ce248c40743c4cbad6472284f3b2a2ab9ef6b86e1a2734b049c0248
>
> ![buy a ticket](TIBA-bbnc(28)-Homework-1/image-20201008004632381-1602138354036.png)
>
> 5.1）there is a minimal gas limit:
>
> ![gas limit is at least 21000](TIBA-bbnc(28)-Homework-1/image-20201008004932339-1602138354036.png)
>
> When I lower the gas limit, I get a failed transaction: (**Out of gas**)
>
> ![a failed transaction](TIBA-bbnc(28)-Homework-1/image-20201008005312172-1602138354036.png)
>
> 5.2）When I try to buy a second ticket for the same address, I get a failed transaction: (**Execution error**, maybe the smart contract constraints that **one address can only buy one ticket**)
>
> ![buy a second ticket](TIBA-bbnc(28)-Homework-1/image-20201008005449147-1602138354036.png)
>
> On the contrary, if I choose to buy a second ticket from another account(address):（first, need unauthorize the website, and reconnect to choose another account）
>
> ![buy a second ticket from another account](TIBA-bbnc(28)-Homework-1/image-20201008010009472-1602138354036.png)

### query ticket purchases

6)Try querying recent ticket purchases. Has there been any?

> Yes. Use the `Purchase` method: (And that `"0x1e51d..` address is one of my account)
>
> ![query recent ticket purchases](TIBA-bbnc(28)-Homework-1/image-20201008010347232-1602138354036.png)

### creator of the Tickets contract

7)Who is the creator of the Tickets contract?

> First, use `owner` method to get an address:
>
> ![owner](TIBA-bbnc(28)-Homework-1/image-20201008011005416-1602138354036.png)
>
> Then search for the address:
>
> ![search for the address](TIBA-bbnc(28)-Homework-1/image-20201008011130430-1602138354036.png)
>
> This seems not what we want, so I track which account all the tokens are transferred into:
>
> ![find an account](TIBA-bbnc(28)-Homework-1/image-20201008011846655-1602138354036.png)
>
> And...search, with two-step validation, I think I've found the creator of this contract:
>
> - most definitely `0x1dbda5dd2e952914bc74a802510d0fa59f9d7636`
>
> ![search the account](TIBA-bbnc(28)-Homework-1/image-20201008012202607-1602138354036.png)
>
> And I think `0x8B017126d2FEDe908a86B36b43969F17d25F3770` is the address of this contract. But I couldn't be able to find any source code of the contract using Conflux Scan.

#### balance of this account

8)What is the balance of this account? How do you think this account acquired these tokens?

> The creator's address `0x1dbda5dd2e952914bc74a802510d0fa59f9d7636`:
>
> - **31682.677136697254853623 CFX**
>
>   ▸ earn CFX through mining ([mining.confluxnetwork.org](https://mining.confluxnetwork.org)) mining is reasonable for this address
>
>   ▸ earn FC through bounty ([bounty.conflux-chain.org](https://bounty.conflux-chain.org)) design a smart contract might get this
>
> The contract's address `0x8b017126d2fede908a86b36b43969f17d25f3770`:
>
> - **330 CFX**
>
>   ▸people buy tickets from this address and send it 33 * 10 CFX (which means there are 33 tickets been sold)

##  the most FC tokens address

9)Which address holds the most FC tokens?

> 1. the conflux system address
>    1. System is responsible for 1:1 exchange of FC/CFX transactions
>       1. In this scenario, the contract creator's address `0x144aa8f554d2ffbc81e0aa0f533f76f5220db09c` might have had the most FC tokens because this address is currently holding an enormous amount of CFX roughly about 999999996999988 CFX. That's really something.
>    2. System delivers FC tokens to all other users
>    3. So in theory it should hold the most FC tokens
> 2. `0x1878e9b8d2fec316a2e666485b927e92a3b4f43e`
>    1. This address holds 55999 FC tokens, and was involved in the first FC contract transaction
>    2. Considering the total amount of FC tokens is about 4484424 FC tokens, this could also have a great chance to be the address that holds the most FC tokens