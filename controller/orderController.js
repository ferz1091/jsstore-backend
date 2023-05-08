const Order = require('../models/Order');
const Product = require('../models/Product');
const mailService = require('../service/mailService');

class OrderController {
    async createOrder(req, res) {
        try {
            const orderPayload = req.body;
            let quantityIsNotCorrect = false;
            const refreshedProducts = [];
            for (const product of orderPayload.products) {
                const prod = await Product[product.item.gender].findById(product.item._id);
                const amount = prod.amount.find(size => size.size === product.size);
                if (!amount || amount && amount.amount < product.amount) {
                    quantityIsNotCorrect = true;
                    product.amount = amount.amount;
                    product.error = `Only ${amount.amount} items available in size ${product.size}`
                }
                refreshedProducts.push({...product, item: prod});
            }
            if (quantityIsNotCorrect) {
                return res.status(200).send({products: refreshedProducts, quantityIsNotCorrect})
            } else {
                for (const product of orderPayload.products) {
                    const prod = await Product[product.item.gender].findById(product.item._id);
                    prod.amount = prod.amount.map(size => {
                        if (size.size === product.size) {
                            return {
                                ...size,
                                amount: size.amount - product.amount
                            }
                        } else {
                            return size;
                        }
                    })
                    await prod.save();
                }
                const order = new Order({
                    ...orderPayload,
                    order_date: new Date(),
                    status_date: null,
                    sent_date: null,
                    done: false,
                    canceled: false,
                    sent: false
                });
                mailService.sendOrderDetails(orderPayload.contactDetails.email, order, refreshedProducts);
                await order.save();
                return res.status(200).json({ message: 'Order has been created', id: order._id });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).send({ message: error.message });
        }
    }
    async changeOrderStatus(req, res) {
        try {
            const {_id, flag} = req.body;
            if (!_id || !flag) {
                return res.status(400).json({message: 'Flag or id is undefined'});
            }
            if (flag.canceled && flag.done) {
                return res.status(400).json({message: 'Invalid flag'});
            }
            const order = await Order.findOne({_id});
            if (!order) {
                return res.status(400).json({message: 'Order did not found'});
            }
            await Order.updateOne(
                {_id},
                {$set: {
                    "done": flag.done, 
                    "canceled": flag.canceled,
                    "status_date": new Date()
                }}
            )
            return res.status(200).json({message: 'Status has changed'});
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Put error', error: e});
        }
    }
    async deleteOrder(req, res) {
        try {
            const {_id} = req.body;
            const order = await Order.findOne({_id});
            if (!order) {
                return res.status(400).json({message: 'Order did not find'});
            }
            await Order.findOneAndDelete({_id});
            return res.status(200).json({message: 'Order has deleted'});
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Delete error', error: e});
        }
    }
}

module.exports = new OrderController();
