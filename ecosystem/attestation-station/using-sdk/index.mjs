#! /usr/local/bin/node

// wagmi prefers to use JavaScript modules, see https://wagmi.sh/react/module-types

// Read .env
const dotenv = await import("dotenv")
dotenv.config()

const ethers = await import("ethers")
const wagmiCore = await import("@wagmi/core")
const wagmiAlchemy = await import("@wagmi/core/providers/alchemy")
const wagmiChains = await import("@wagmi/core/chains")
const atst = await import("@eth-optimism/atst")


const { chains, provider, webSocketProvider } = wagmiCore.configureChains(
  [wagmiChains.optimismGoerli],
  [wagmiAlchemy.alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY })],
)




const setup = () => {
  wagmiCore.createClient({
    provider,
    webSocketProvider
  })
}   // end of setup



// \/  Definitions only required for writing attestations  \/

const wagmiCoreMock = await import("@wagmi/core/connectors/mock")


const writeSetup = async () => {

  // Connect the client to a mock connector
  await wagmiCore.connect({
    // MockConnector is used for server processes when there is no
    // user wallet
    connector: new wagmiCoreMock.MockConnector({
      options: {
        chainId: chains[0].ids,
        signer: new ethers.Wallet(process.env.PRIVATE_KEY, 
          provider(wagmiChains.optimismGoerli)
        ),
      },
    }),   // end of new wagmiCoreMock.MockConnector
  })   // end of wagmiCore.connect

}  // end of writeSetup


//  /\  Definitions only required for writing attestations /\



const main = async () => {

    setup()
    await writeSetup()
    
    const readCreatorAddr = "0xc2dfa7205088179a8644b9fdcecd6d9bed854cfe"
    const aboutAddr = "0x00000000000000000000000000000000000060A7"
    const key = "animalfarm.school.GPA"

    // Read an attestation
    const val = await atst.readAttestation(
        readCreatorAddr,
        aboutAddr,
        key,
        "string")    // data type
    
    console.log(`According to ${readCreatorAddr} the ${key} for ${aboutAddr} is ${val}`)
    
    console.log(`--------------`)


     
    const preparedTx = await atst.prepareWriteAttestation(
      "0x00000000000000000000000000000000000060A7",  // about
      "animalfarm.school.GPA",                       // key
      "3.25",                                        // value
    )

    // const txReq = preparedTx.request
    const tx = await atst.writeAttestation(preparedTx)
    const rcpt = await tx.wait()
    console.log(`Attestation written:`)
    console.log(`https://goerli-explorer.optimism.io/tx/${rcpt.transactionHash}`)
}


await main()
process.exit(0)