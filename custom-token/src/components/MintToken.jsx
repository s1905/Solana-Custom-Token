import { 
    clusterApiUrl, 
    Connection, 
    PublicKey, 
    Keypair, 
    LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
    createMint, 
    getOrCreateAssociatedTokenAccount, 
    mintTo, 
    transfer, 
    Account, 
    getMint, 
    getAccount
} from '@solana/spl-token';

// Special setup to add a Buffer class, because it's missing
window.Buffer = window.Buffer || require("buffer").Buffer;

export default function MintToken() {

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    const fromWallet = Keypair.generate();
    const toWallet = new PublicKey("9o13FAL2BZDyUor6nDUZsXCpHXLzHQrhdTh2FmH7VKan");

    let mint;
    let fromTokenAccount;

    async function createToken() {
        const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(fromAirdropSignature);

        mint = await createMint(
            connection, 
            fromWallet, 
            fromWallet.publicKey, 
            null, 
            6 // 6 decimals in token
        );
        console.log(`Create token: ${mint.toBase58()}`);

        // create or get account to store custom token for receiver
        fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey
        );
        console.log(`Create Token Account: ${fromTokenAccount.address.toBase58()}`);
    }

    async function mintToken() {
        // Mint 100 new tokens to the "fromTokenAccount" account we just created
        const signature = await mintTo(
            connection,
            fromWallet,
            mint,
            fromTokenAccount.address,
            fromWallet.publicKey,
            100000000000 // 100 billion
        );
        console.log(`Mint signature: ${signature}`);
    }

    async function checkBalance() {
        // get the supply of tokens we have minted into existance
        const mintInfo = await getMint(connection, mint);
		console.log(mintInfo.supply);
		
		// get the amount of tokens left in the account
        const tokenAccountInfo = await getAccount(connection, fromTokenAccount.address);
		console.log(tokenAccountInfo.amount);
    }

    async function sendToken() {
        // Get the token account of the toWallet address, and if it does not exist, create it
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);
        console.log(`toTokenAccount ${toTokenAccount.address}`);

        const signature = await transfer(
            connection,
            fromWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            100000000000 // 1 billion
        );
        console.log(`finished transfer with ${signature}`);
    }

    return (
      <div>
          Mint Token Section
          <div>
              <button onClick={createToken}>Create Token</button>
              <button onClick={mintToken}>Mint Token</button>
              <button onClick={checkBalance}>Check Balance</button>
              <button onClick={sendToken}>Send Token</button>
          </div>
      </div>
    );
}