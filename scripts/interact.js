const hre = require("hardhat");

async function main() {
  console.log("Deploying EcommerceDelivery contract...");

  // Get contract factory and deployed contract instance
  const EcommerceDelivery = await hre.ethers.getContractFactory("EcommerceDelivery");

  // Replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const ecommerceDelivery = EcommerceDelivery.attach(contractAddress);

  // Get accounts
  const [deployer, producer, consumer] = await hre.ethers.getSigners();

  console.log("Interacting with EcommerceDelivery contract");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`Producer Address: ${producer.address}`);
  console.log(`Consumer Address: ${consumer.address}`);

  // Example: Create an order
  const productId = 1;
  const productName = "Smartphone";
  const productPrice = hre.ethers.parseEther("1.0"); // 1 ETH

  console.log(`\nCreating order for ${productName} (${productPrice} wei)...`);
  
  const tx = await ecommerceDelivery.connect(consumer).createOrder(
    producer.address,
    productId,
    productName,
    productPrice,
    { value: productPrice }
  );
  
  await tx.wait();
  console.log("Order created successfully!");

  // Validate consumer address and set up signer
  const orderCount = await ecommerceDelivery.orderCount();
  console.log(`Total orders created: ${orderCount}`);

  const orderId = orderCount - 1; // Last created order

  const consumerAddress = await ecommerceDelivery.orders(orderId).then(order => order.consumer);
  console.log(`Stored consumer address: ${consumerAddress}`);
  
  const signer = hre.ethers.provider.getSigner(consumerAddress);
  console.log(`Caller address (signer): ${await signer.getAddress()}`);

  // Specify delivery date
  const deliveryDate = Math.floor(Date.now() / 1000) + 86400; // Example: 1 day from now
  console.log(`\nSpecifying delivery date: ${new Date(deliveryDate * 1000).toLocaleString()}...`);

  const specifyDeliveryTx = await ecommerceDelivery.connect(signer).specifyDeliveryDate(orderId, deliveryDate);
  await specifyDeliveryTx.wait();
  console.log("Delivery date specified successfully!");

  // Get order details
  const orderDetails = await ecommerceDelivery.getOrderDetails(orderId);
  console.log("Order Details:");
  console.log(`- Consumer: ${orderDetails[0]}`);
  console.log(`- Producer: ${orderDetails[1]}`);
  console.log(`- Product ID: ${orderDetails[2]}`);
  console.log(`- Product Name: ${orderDetails[3]}`);
  console.log(`- Product Price: ${orderDetails[4]}`);
  console.log(`- Purchase Time: ${new Date(Number(orderDetails[5]) * 1000)}`);
  console.log(`- Delivery Time: ${orderDetails[6] === 0 ? 'Not specified yet' : new Date(Number(orderDetails[6]) * 1000).toLocaleString()}`);
  console.log(`- Status: ${orderDetails[7]}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
