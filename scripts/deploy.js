const hre = require("hardhat");

async function main() {
  console.log("Deploying EcommerceDelivery contract...");

  // Deploy the contract
  const EcommerceDelivery = await hre.ethers.getContractFactory("EcommerceDelivery");
  const ecommerceDelivery = await EcommerceDelivery.deploy();

  await ecommerceDelivery.waitForDeployment();

  const address = await ecommerceDelivery.getAddress();
  console.log(`EcommerceDelivery deployed to: ${address}`);

  // Get accounts
  const [deployer, producer, consumer] = await hre.ethers.getSigners();

  console.log("Creating an order...");
  // Create a new order before specifying the delivery date
  const productId = 1;
  const productName = "Smartphone";
  const productPrice = hre.ethers.parseEther("1.0"); // 1 ETH

  const createOrderTx = await ecommerceDelivery.connect(consumer).createOrder(
    producer.address,
    productId,
    productName,
    productPrice,
    { value: productPrice }
  );
  await createOrderTx.wait();
  console.log("Order created successfully!");

  // Example: Specify delivery date after creating the order
  console.log("Specifying a delivery date...");

  const orderId = 0; // Replace with the relevant order ID
  const deliveryDate = Math.floor(Date.now() / 1000) + 86400; // Example: 1 day from now

  try {
    // Fetch the consumer address from the contract
    const orderDetails = await ecommerceDelivery.getOrderDetails(orderId);
    const consumerAddress = orderDetails[0]; // Consumer address is the first value in `getOrderDetails`

    if (consumerAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Consumer address for order ID ${orderId} is uninitialized. Please check the order creation logic.`);
    }

    console.log(`Consumer address: ${consumerAddress}`);

    // Find the signer for the consumer address
    const accounts = await hre.ethers.getSigners();
    const consumerSigner = accounts.find(account => account.address.toLowerCase() === consumerAddress.toLowerCase());

    if (!consumerSigner) {
      throw new Error(`Signer for the consumer address ${consumerAddress} not found. Ensure the signer is part of your local accounts.`);
    }

    console.log(`Using signer with address: ${consumerSigner.address}`);

    // Call the specifyDeliveryDate function
    const specifyDeliveryTx = await ecommerceDelivery.connect(consumerSigner).specifyDeliveryDate(orderId, deliveryDate);

    await specifyDeliveryTx.wait();
    console.log(`Delivery date specified: ${new Date(deliveryDate * 1000).toLocaleString()}`);
  } catch (error) {
    console.error(`Error specifying delivery date: ${error.message}`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
