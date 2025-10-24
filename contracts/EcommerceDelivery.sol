// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EcommerceDelivery {
    enum OrderStatus { Created, Shipped, Delivered, Completed, Cancelled }
    
    struct Order {
        address payable consumer;
        address payable producer;
        uint256 productId;
        string productName;
        uint256 productPrice;
        uint256 purchaseTime;
        uint256 deliveryTime;
        OrderStatus status;
        bool consumerConfirmedDelivery;
        bool producerConfirmedShipment;
    }
    
    mapping(uint256 => Order) public orders;
    uint256 public orderCount;
    
    event OrderCreated(uint256 orderId, address consumer, address producer, uint256 productId, uint256 purchaseTime);
    event OrderShipped(uint256 orderId, uint256 shippedTime);
    event OrderDelivered(uint256 orderId, uint256 deliveryTime);
    event PaymentReleased(uint256 orderId, uint256 amount);
    event OrderCancelled(uint256 orderId);
    event DeliveryDateSpecified(uint256 orderId, uint256 specifiedDeliveryTime);
    
    uint256 public constant DELIVERY_PERIOD = 48 hours;
    
    function createOrder(address payable _producer, uint256 _productId, string memory _productName, uint256 _productPrice) external payable {
        require(msg.value == _productPrice, "Payment must match the product price");
        require(_producer != address(0), "Invalid producer address");
        
        uint256 orderId = orderCount++;
        
        orders[orderId] = Order({
            consumer: payable(msg.sender),
            producer: _producer,
            productId: _productId,
            productName: _productName,
            productPrice: _productPrice,
            purchaseTime: block.timestamp,
            deliveryTime: 0,
            status: OrderStatus.Created,
            consumerConfirmedDelivery: false,
            producerConfirmedShipment: false
        });
        
        emit OrderCreated(orderId, msg.sender, _producer, _productId, block.timestamp);
    }
    
    function confirmShipment(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        
        require(msg.sender == order.producer, "Only the producer can confirm shipment");
        require(order.status == OrderStatus.Created, "Order is not in created state");
        
        order.producerConfirmedShipment = true;
        order.status = OrderStatus.Shipped;
        
        emit OrderShipped(_orderId, block.timestamp);
    }
    
    function confirmDelivery(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        
        require(msg.sender == order.consumer, "Only the consumer can confirm delivery");
        require(order.status == OrderStatus.Shipped, "Order must be shipped first");
        
        order.consumerConfirmedDelivery = true;
        order.deliveryTime = block.timestamp;
        order.status = OrderStatus.Delivered;
        
        emit OrderDelivered(_orderId, block.timestamp);
        
        processPayment(_orderId);
    }
    
    function processPayment(uint256 _orderId) internal {
        Order storage order = orders[_orderId];
        
        require(order.status == OrderStatus.Delivered, "Order must be in delivered state");
        
        uint256 deliveryDuration = order.deliveryTime - order.purchaseTime;
        uint256 paymentAmount;
        
        if (deliveryDuration <= DELIVERY_PERIOD) {
            paymentAmount = order.productPrice;
        } else {
            paymentAmount = order.productPrice / 2;
            uint256 refundAmount = order.productPrice - paymentAmount;
            order.consumer.transfer(refundAmount);
        }
        
        order.producer.transfer(paymentAmount);
        order.status = OrderStatus.Completed;
        
        emit PaymentReleased(_orderId, paymentAmount);
    }
    
    function cancelOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        
        require(msg.sender == order.consumer, "Only the consumer can cancel the order");
        require(order.status == OrderStatus.Created, "Order can only be cancelled before shipping");
        
        order.status = OrderStatus.Cancelled;
        order.consumer.transfer(order.productPrice);
        
        emit OrderCancelled(_orderId);
    }

    function specifyDeliveryDate(uint256 _orderId, uint256 _deliveryTime) external {
        Order storage order = orders[_orderId];
        
        require(msg.sender == order.consumer, "Only the consumer can specify the delivery date");
        require(order.status == OrderStatus.Created || order.status == OrderStatus.Shipped, "Order must be in created or shipped state");
        require(_deliveryTime > block.timestamp, "Delivery time must be in the future");
        
        order.deliveryTime = _deliveryTime;
        
        emit DeliveryDateSpecified(_orderId, _deliveryTime);
    }
    
    function getOrderDetails(uint256 _orderId) external view returns (
        address consumer,
        address producer,
        uint256 productId,
        string memory productName,
        uint256 productPrice,
        uint256 purchaseTime,
        uint256 deliveryTime,
        OrderStatus status
    ) {
        Order storage order = orders[_orderId];
        return (
            order.consumer,
            order.producer,
            order.productId,
            order.productName,
            order.productPrice,
            order.purchaseTime,
            order.deliveryTime,
            order.status
        );
    }
    
    function isDeliveryOnTime(uint256 _orderId) external view returns (bool) {
        Order storage order = orders[_orderId];
        if (order.deliveryTime == 0) {
            return false;
        }
        return (order.deliveryTime - order.purchaseTime) <= DELIVERY_PERIOD;
    }
}
