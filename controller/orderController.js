const defineProductType = require('../tools/defineProductType');
const Order = require('../models/Order');

class OrderController {
    async createOrder(req, res) {
        try {
            const { products, username } = req.body;
            let value = 0;
            for (let product of products) {
                const instance = defineProductType(Number(product.type));
                const prod = await instance.findOne({ _id: product._id });
                if (!prod) {
                    return res.status(400).json({ message: 'Product not found' });
                }
                if (!prod.amount.some(item => item.size === product.size && item.amount >= product.amount)) {
                    return res.status(400).json({ message: 'The product is out of stock' })
                }
                if (prod.isSale.flag) {
                    value += prod.isSale.value * product.amount;
                } else {
                    value += prod.value * product.amount;
                }
            }
            const order = new Order({ products, username, value, order_date: new Date(), status_date: null, canceled: false, done: false });
            order.save();
            for (let product of products) {
                const instance = defineProductType(Number(product.type));
                await instance.updateOne(
                    { _id: product._id },
                    { $inc: { "amount.$[elem].amount": product.amount - (2 * product.amount) } },
                    { arrayFilters: [{ "elem.size": { $eq: product.size } }] }
                )
            }
            return res.status(200).json({ message: 'Order has created' })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ message: 'Put error' })
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
            await Order.findOneAndDelete({_id});
            return res.status(200).json({message: 'Order has deleted'})
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Delete error', error: e});
        }
    }
}

module.exports = new OrderController();
