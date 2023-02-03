const Product = require('../models/Product');
const {allowQuery} = require('../config');

function defineProductType (type) {
    switch (type) {
        case 1: {
            return Product.Outerwear_male;
        }
        case 2: {
            return Product.Outerwear_female;
        }
        case 3: {
            return Product.wear_male;
        }
        case 4: {
            return Product.wear_female;
        }
        case 5: {
            return Product.Footwear_male;
        }
        case 6: {
            return Product.Footwear_female;
        }
        default: {
            return false;
        }
    }
}

class ProductController {
    async addProduct (req, res) {
        try {
            const body = JSON.parse(req.body.product);
            const {type, prod, title} = body;
            prod.images = req.files.map((file, index) => {
                return {path: file.destination + file.filename, title: index === title ? true : false}
            })
            if (type < 1 || type > 6) {
                return res.status(400).json({message: 'Invalid product type'})
            }
            const instance = defineProductType(Number(type));
            const product = new instance(prod);
            await product.save();
            return res.status(200).json({message: 'DONE'})
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Post error'})
        }
    }
    async getProduct (req, res) {
        try {
            const query = req.query;
            let page = 1;
            if (!query.type) {
                return res.status(400).json({message: 'Must contain query TYPE'})
            }
            if (!Object.keys(query).every(q => allowQuery.products.some(a => a === q))) {
                return res.status(400).json({ message: 'Wrong query parameters!' })
            }
            if (query.page && query.page < 1) {
                return res.status(400).json({ message: 'Page must be greater than 1' })
            } else {
                page = query.page;
            }
            const instance = defineProductType(Number(query.type));
            const products = await instance.find({}, {}, {skip: (page - 1) * 20, limit: 20 });
            const totalCount = await instance.countDocuments();
            return res.status(200).json({totalCount, data: products});
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Get error'})
        }
    }
    async deleteProduct(req, res) {
        try {
            const {type, id} = req.body;
            if (!type || !id) {
                return res.status(400).json({message: 'Type or id is undefined'})
            }
            const instance = defineProductType(Number(type));
            await instance.findOneAndDelete({id});
            return res.status(200).json({message: 'Product has deleted'});
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Delete error'})
        }
    }
    async updateProduct(req, res) {
        try {
            const {type, id, prod} = req.body;
            if (!type || !id) {
                return res.status(400).json({ message: 'Type or id is undefined' })
            }
            const instance = defineProductType(Number(type));
            const product = new instance(prod);
            let productToUpdate = {};
            Object.assign(productToUpdate, product._doc);
            delete productToUpdate._id;
            await instance.replaceOne({id}, productToUpdate);
            return res.status(400).json({ message: 'Product has updated' })
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Put error'})
        }
    }
}

module.exports = new ProductController();
