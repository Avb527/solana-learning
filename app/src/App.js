import './App.css';
import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';
import idl from './idl.json';
import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  new PhantomWalletAdapter()
]

const { SystemProgram, Keypair } = web3;
/* create an account  */
const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
  const [value, setValue] = useState(null);
  const wallet = useWallet();

  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = "https://api.devnet.solana.com";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function createCounter() {    
    const provider = await getProvider()
    /* create the program interface combining the idl, program ID, and provider */
    const program = new Program(idl, programID, provider);

	const [dataAcc, dataAccbump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("meta_data"),
		program.provider.wallet.publicKey.toBytes()
      ],
      program.programId
    )

    try {
      /* interact with the program via rpc */
      await program.rpc.create({
        accounts: {
          baseAccount: dataAcc,
          user: program.provider.wallet.publicKey,
          tokenProgram:spl.TOKEN_PROGRAM_ID,
      	  associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram:anchor.web3.SystemProgram.programId,
          rent:anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
        signers: []
      });

      const account = await program.account.baseAccount.fetch(dataAcc);
      console.log('account: ', account);
      setValue(account.count.toString());
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  async function increment() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);

	const [dataAcc, dataAccbump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("meta_data"),
		program.provider.wallet.publicKey.toBytes()
      ],
      program.programId
    )

    await program.rpc.increment({
      accounts: {
        baseAccount: dataAcc,
		authority: program.provider.wallet.publicKey,
		tokenProgram:spl.TOKEN_PROGRAM_ID,
      	associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram:anchor.web3.SystemProgram.programId,
        rent:anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      }
    });

    const account = await program.account.baseAccount.fetch(dataAcc);
    console.log('account: ', account);
    setValue(account.count.toString());
  }

  async function view() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);

	const [dataAcc, dataAccbump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("meta_data"),
		program.provider.wallet.publicKey.toBytes()	
      ],
      program.programId
    )

    await program.rpc.view({
      accounts: {
        baseAccount: dataAcc,
		viewer: program.provider.wallet.publicKey,
		tokenProgram:spl.TOKEN_PROGRAM_ID,
      	associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram:anchor.web3.SystemProgram.programId,
        rent:anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      }
    });

    const account = await program.account.baseAccount.fetch(dataAcc);
    console.log('account: ', account);
    setValue(account.count.toString());
  }

  async function close() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);

	const [dataAcc, dataAccbump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("meta_data"),
		program.provider.wallet.publicKey.toBytes()	
      ],
      program.programId
    )

    await program.rpc.close({
      accounts: {
        baseAccount: dataAcc,
		target: program.provider.wallet.publicKey,
		tokenProgram:spl.TOKEN_PROGRAM_ID,
      	associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram:anchor.web3.SystemProgram.programId,
        rent:anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      }
    });

    const account = await program.account.baseAccount.fetch(dataAcc);
    console.log('account: ', account);
    setValue(account.count.toString());
  }

  if (!wallet.connected) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="App">
        <div>
          <button onClick={createCounter}>Create counter</button>
          <br/>
          <br/>
          <button onClick={view}>View</button>
          <br/>
          <br/>
          <button onClick={increment}>Increment Data</button>
		  <br/>
          <br/>
          <button onClick={close}>Close counter</button>
        </div>
      </div>
    );
  }
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
  <ConnectionProvider endpoint="https://api.devnet.solana.com">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;
