describe("Order Fulfillment", function () {
  beforeEach(async function () {
    // Create an order
    await ecommerceDelivery.connect(consumer).createOrder(
      producer.address,
      productId,
      productName,
      productPrice,
      { value: productPrice }
    );
  });

  describe("Order Creation", function () {
    it("Should create a valid order", async function () {
      const tx = await ecommerceDelivery.connect(consumer).createOrder(
        producer.address,
        productId,
        productName,
        productPrice,
        { value: productPrice }
      );
      await tx.wait();

      const orderDetails = await ecommerceDelivery.getOrderDetails(0);
      expect(orderDetails[0]).to.equal(consumer.address); // Verify consumer
    });
  });

  it("Should allow producer to confirm shipment", async function () {
    await ecommerceDelivery.connect(producer).confirmShipment(0);
    const orderDetails = await ecommerceDelivery.getOrderDetails(0);
    expect(orderDetails[7]).to.equal(1); // status (Shipped)
  });

  it("Should not allow non-producer to confirm shipment", async function () {
    await expect(
      ecommerceDelivery.connect(consumer).confirmShipment(0)
    ).to.be.revertedWith("Only the producer can confirm shipment");
  });

  it("Should allow consumer to confirm delivery after shipment", async function () {
    // Confirm shipment first
    await ecommerceDelivery.connect(producer).confirmShipment(0);
    
    // Confirm delivery
    await ecommerceDelivery.connect(consumer).confirmDelivery(0);
    
    // Get order details
    const orderDetails = await ecommerceDelivery.getOrderDetails(0);
    expect(orderDetails[7]).to.equal(3); // status (Completed)
  });

  // New test case for specifying delivery date
  it("Should allow only the consumer to specify delivery date", async function () {
    const consumerSigner = ethers.provider.getSigner(consumer.address);

    // Specify delivery date
    const deliveryTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    await ecommerceDelivery.connect(consumerSigner).specifyDeliveryDate(0, deliveryTime);

    // Validate delivery time
    const order = await ecommerceDelivery.orders(0);
    expect(order.deliveryTime).to.equal(deliveryTime);
  });
});
