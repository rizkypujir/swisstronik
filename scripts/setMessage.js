const hre = require("hardhat");
const { encryptDataField } = require("@swisstronik/utils");

/**
 * Send a shielded transaction to the Swisstronik blockchain.
 *
 * @param {object} signer - The signer object for sending the transaction.
 * @param {string} destination - The address of the contract to interact with.
 * @param {string} data - Encoded data for the transaction.
 * @param {number} value - Amount of value to send with the transaction.
 *
 * @returns {Promise} - The transaction object.
 */
const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Ambil link RPC dari konfigurasi jaringan
  const rpclink = hre.network.config.url;

  // Enkripsi data transaksi
  const [encryptedData] = await encryptDataField(rpclink, data);

  // Buat dan tandatangani transaksi dengan data terenkripsi
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  // Alamat kontrak yang telah dideploy
  const contractAddress = "0x34826e8cB0e405a330381F7617657361FEAeC73d";

  // Ambil signer (akun Anda)
  const [signer] = await hre.ethers.getSigners();

  // Buat instance kontrak
  const contractFactory = await hre.ethers.getContractFactory("Swisstronik");
  const contract = contractFactory.attach(contractAddress);

  // Kirim transaksi shielded untuk mengatur pesan dalam kontrak
  const functionName = "setMessage";
  const messageToSet = "Hello Swisstronik!!";
  const setMessageTx = await sendShieldedTransaction(
    signer,
    contractAddress,
    contract.interface.encodeFunctionData(functionName, [messageToSet]),
    0
  );
  await setMessageTx.wait();

  // Tampilkan Receipt Transaksi
  console.log("Transaction Receipt: ", setMessageTx);
}

// Jalankan fungsi utama dan tangani error
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
