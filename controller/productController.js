const Product = require('../models/Product');
const productService = require('../service/productService');
const fs = require('fs');
class ProductController {
    async addProduct (req, res) {
        try {
            const body = JSON.parse(req.body.product);
            const {type, prod, title} = body;
            prod.images = req.files.map((file, index) => {
                return {path: file.destination + file.filename, title: index === title ? true : false}
            })
            if (type !== 'men' && type !== 'women') {
                return res.status(400).json({message: 'Invalid product type'});
            }
            const product = new Product[type](prod);
            await product.save();
            return res.status(200).json({message: 'DONE'});
        } catch (e) {
            console.log(e);
            req.files.forEach(file => {
                fs.rm(`./images/${file.filename}`);
            })
            return res.status(400).json({message: 'Post error'});
        }
    }
    async getProducts (req, res) {
        try {
            const {gender, category, currentPage, sort, brands, types} = req.query;
            let page = 1;
            if (!gender || !category) {
                return res.status(400).send({error: 'Must contain query GENDER and CATEGORY'});
            }
            if (gender !== 'men' && gender !== 'women') {
                return res.status(400).send({error: 'Invalid gender query'});
            }
            if (currentPage && currentPage < 1) {
                return res.status(400).send({error: 'Page must be greater than 1' });
            } else if (currentPage) {
                page = currentPage;
            }
            const sortParam = sort === 'rating' ? {rating: -1} : sort === 'cheap' ? {value: 1} : {value: -1};
            const {data, totalCount} = await productService.getProducts(gender, category, brands, types, sortParam, page);
            return res.status(200).send({totalCount, data, totalPages: Math.ceil(totalCount / 20), page: Number(page)});
        } catch (e) {
            console.log(e);
            return res.status(400).send({error: e.message});
        }
    }
    async deleteProduct(req, res) {
        try {
            const {type, id} = req.body;
            if (!type || !id) {
                return res.status(400).json({message: 'Type or id is undefined'})
            }
            const instance = defineProductType(Number(type));
            const prod = await instance.findOneAndDelete({id});
            prod.images.forEach(image => fs.rm(`./${image.path}`, (err) => {
                if (err) console.log(err)
            }));
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
    async getFilterStats(req, res) {
        try {
            const {gender, category, brands, types} = req.query;
            if (!gender || !category) {
                return res.status(400).send({ error: "Must contain query GENDER and CATEGORY" });
            }
            if (gender !== 'men' && gender !== 'women') {
                return res.status(400).send({ error: 'Invalid gender query' });
            }
            const {brandStats, typeStats, valueRange} = await productService.createFilterStats(gender, category, brands, types);
            res.status(200).send({typeStats, brandStats, valueRange});
        } catch (e) {
            console.log(e);
            res.status(400).send({error: e.message});
        }
    }
}

module.exports = new ProductController();
