const Product = require('../models/Product');
const Rating = require('../models/Rating');
const User = require('../models/User');
const productService = require('../service/productService');
const fs = require('fs');
class ProductController {
    async addProduct (req, res) {
        try {
            const body = JSON.parse(req.body.product);
            const {type, prod, title} = body;
            const article = await productService.createProductArticle(type, prod.category);
            prod.images = req.files.map((file, index) => {
                return {path: file.destination + file.filename, title: index === title ? true : false}
            })
            if (type !== 'men' && type !== 'women') {
                return res.status(400).json({message: 'Invalid product type'});
            }
            const product = new Product[type]({
                ...prod,
                article,
                date: new Date(), 
                isSale: { oldValue: 0, flag: false }, 
                rating: 0, 
                rateAmount: 0
            });
            await product.save();
            return res.status(200).json({message: 'Product has been added.', link: `/product/${type}/${product._id}`});
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
            const {gender, category, currentPage, sort, brands, types, range} = req.query;
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
            const {data, totalCount} = await productService.getProducts(gender, category, brands, types, sortParam, page, range);
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
            const {gender, category, brands, types, sale, categoryFilters, range} = req.query;
            if (!gender) {
                return res.status(400).send({ error: "Must contain query GENDER" });
            }
            if (gender !== 'men' && gender !== 'women') {
                return res.status(400).send({ error: 'Invalid gender query' });
            }
            const { brandStats, typeStats, valueRange, categoryStats } = await productService.createFilterStats(gender, category, brands, types, sale, categoryFilters, range);
            const filters = {typeStats, brandStats, valueRange};
            if (categoryStats) filters.categoryStats = categoryStats;
            res.status(200).send(filters);
        } catch (e) {
            console.log(e);
            res.status(400).send({error: e.message});
        }
    }
    async getSale(req, res) {
        try {
            const {gender, currentPage, sort, brands, types, categoryFilters, range} = req.query;
            let page = 1;
            if (gender && gender !== 'men' && gender !== 'women') {
                return res.status(400).send({ error: 'Invalid gender query' });
            }
            if (currentPage && currentPage < 1) {
                return res.status(400).send({ error: 'Page must be greater than 1' });
            } else if (currentPage) {
                page = currentPage;
            }
            const sortParam = sort === 'rating' ? { rating: -1 } : sort === 'cheap' ? { value: 1 } : { value: -1 };
            const { data, totalCount } = await productService.getSale(gender, page, sortParam, brands, types, categoryFilters, range);
            return res.status(200).send({totalCount, data, totalPages: Math.ceil(totalCount / 20), page: Number(page)});
        } catch (e) {
            console.log(e);
            res.status(400).send({error: e.message});
        }
    }
    async getProductById(req, res) {
        try {
            const {gender, id} = req.query;
            if (!gender || !['men', 'women'].some(item => item === gender)) {
                throw new Error('Invalid gender');
            }
            if (!id || id.length !== 24) {
                throw new Error('Invalid id');
            }
            const prod = await Product[gender].findById(id);
            res.status(200).send(prod);
        } catch (e) {
            console.log(e);
            res.status(400).send({error: e.message});
        }
    }
    async getProductComments(req, res) {
        try {
            const {gender, id, page, user, sort} = req.query;
            let currentPage = 1;
            if (!gender || !['men', 'women'].some(item => item === gender)) {
                throw new Error('Invalid gender');
            }
            if (!id) {
                throw new Error('Invalid id');
            }
            if (page) {
                currentPage = Number(page);
            }
            const prodComments = await Rating[gender].findOne({productId: id});
            let totalPages = 0;
            let totalCount = 0;
            let data = [];
            let userComment = null;
            if (prodComments) {
                totalCount = prodComments.comments.filter(comment => comment.comment).length;
                totalPages = Math.ceil(prodComments.comments.filter(comment => comment.comment && comment.user !== user).length / 10);
                const comments = prodComments.comments.filter(comment => comment.comment && comment.user !== user).sort((a, b) => {
                    if (!sort || sort === 'latest'){
                        if (new Date(a.date) > new Date(b.date)) {
                            return -1;
                        } else {
                            return 1
                        }
                    } else if (sort === 'rating') {
                        if (a.rating && !b.rating) {
                            return -1;
                        } else if (!a.rating && b.rating) {
                            return 1;
                        } else if (a.rating && b.rating) {
                            if (a.rating > b.rating) {
                                return -1;
                            } else {
                                return 1;
                            }
                        } else {
                            return 0;
                        }
                    } else if (sort === 'helpful') {
                        if (a.comment.length > b.comment.length) {
                            if (a.rating && b.rating) {
                                return -1;
                            } else if (!a.rating && b.rating) {
                                return 1;
                            } else {
                                return -1;
                            }
                        } else if (a.comment.length < b.comment.length) {
                            if (a.rating && b.rating) {
                                return 1;
                            } else if (a.rating && !b.rating) {
                                return -1;
                            } else {
                                return 1;
                            }
                        }
                    }
                });
                data = comments.slice(currentPage === 1 ? 0 : (currentPage - 1) * 10, currentPage * 10);
                userComment = prodComments.comments.find(comment => comment.user === user);
            }
            res.status(200).send({data, totalPages, page: currentPage, totalCount, userComment});
        } catch (e) {
            console.log(e)
            res.status(400).send({ error: e.message });
        }
    }
    async rateProduct(req, res) {
        try {
            const {gender, productId, email, comment, rating} = req.body;
            if (!gender || !['men', 'women'].some(item => item === gender)) {
                throw new Error('Invalid gender');
            }
            if (!comment && !rating) {
                throw new Error('Nothing to post');
            }
            const user = await User.find({email});
            if (!user) {
                throw new Error('Email is invalid');
            }
            const prod = await Product[gender].findById(productId);
            if (!prod) {
                throw new Error('Product not found');
            }
            const prodComments = await Rating[gender].findOne({productId});
            if (prodComments) {
                if (prodComments.comments.some(comment => comment.user === email)) {
                    throw new Error('You cannot comment on this product again');
                } else {
                    prodComments.comments.push({
                        user: email,
                        rating: rating ? rating : null,
                        comment: comment ? comment : null,
                        date: new Date(),
                        answer: null
                    });
                    prodComments.save();
                    if (rating) {
                        prod.rateAmount += 1;
                        let rate = 0;
                        let amount = 0; 
                        prodComments.comments.forEach(comment => {
                            if (comment.rating) {
                                rate += comment.rating;
                                amount++;
                            }
                        });
                        prod.rating = Number((rate / amount).toFixed([1]));
                        prod.save();
                    }
                }
            } else {
                const post = new Rating[gender]({
                    productId,
                    comments: [
                        {
                            user: email,
                            rating: rating ? rating : null,
                            comment: comment ? comment : null,
                            date: new Date(),
                            answer: null
                        }
                    ]
                });
                if (rating) {
                    prod.rateAmount += 1;
                    prod.rating = rating;
                    prod.save();
                }
                await post.save();
            }
            res.status(200).send({ message: 'Comment has been posted'});
        } catch (e) {
            console.log(e);
            res.status(400).send({ error: e.message });
        }
    }
    async deleteRate(req, res) {
        try {
            const {gender, productId, email} = req.body;
            if (!gender || !productId || !email) {
                throw new Error('Wrong request');
            }
            let prodComments = await Rating[gender].findOne({productId});
            if (!prodComments) {
                throw new Error('Invalid product id');
            }
            const comment = prodComments.comments.find(comment => comment.user === email);
            let prod = null;
            if (comment.rating) {
                prod = await Product[gender].findById(productId);
                if (!prod) {
                    throw new Error('Product not found');
                }
                if (prod.rateAmount > 1) {
                    const updatedRating = Number((((prod.rating * prod.rateAmount) - comment.rating) / (prod.rateAmount - 1)).toFixed([1]));
                    prod.rating = updatedRating;
                    prod.rateAmount = prod.rateAmount - 1;
                } else {
                    prod.rating = 0;
                    prod.rateAmount = 0;
                }
                prod.save();
            }
            prodComments.comments = prodComments.comments.filter(comment => comment.user !== email);
            prodComments.save();
            res.status(200).send({message: 'Comment has been deleted'});
        } catch (e) {
            console.log(e);
            res.status(400).send({error: e.message});
        }
    }
    async editRate(req, res) {
        try {
            const {gender, productId, email, comment, rating} = req.body;
            const prodComments = await Rating[gender].findOne({productId});
            if (!prodComments) {
                throw new Error('Invalid product ID');
            }
            if (!email) {
                throw new Error('User is not authorized');
            }
            if (!comment && !rating) {
                throw new Error('Nothing to post');
            }
            const oldComment = prodComments.comments.find(comment => comment.user === email);
            prodComments.comments = prodComments.comments.filter(comment => comment.user !== email);
            prodComments.comments.push({
                user: email,
                rating: rating ? rating : null,
                comment: comment ? comment : null,
                date: new Date(),
                answer: null
            });
            let prod = await Product[gender].findById(productId);
            if (!prod) {
                throw new Error('Product not found');
            }
            if (rating) {
                if (oldComment.rating) {
                    if (prod.rateAmount > 1) {
                        const updatedRating = Number(((((prod.rating * prod.rateAmount) - oldComment.rating) + rating) / prod.rateAmount).toFixed([1]));
                        prod.rating = updatedRating;
                    } else {
                        prod.rating = rating;
                    }
                } else {
                    if (!prod.rateAmount) {
                        prod.rating = rating;
                        prod.rateAmount = 1;
                    } else {
                        const updatedRating = Number((((prod.rating * prod.rateAmount) + rating) / (prod.rateAmount + 1)).toFixed([1]));
                        prod.rating = updatedRating;
                        prod.rateAmount = prod.rateAmount + 1;
                    }
                }
                prod.save();
            } else {
                if (oldComment.rating) {
                    if (prod.rateAmount > 1) {
                        const updatedRating = Number((((prod.rating * prod.rateAmount) - oldComment.rating) / (prod.rateAmount - 1)).toFixed([1]));
                        prod.rating = updatedRating;
                        prod.rateAmount = prod.rateAmount - 1;
                    } else {
                        prod.rating = 0;
                        prod.rateAmount = 0;
                    }
                    prod.save();
                }
            }
            prodComments.save();
            res.status(200).send({message: 'Comment has been updated'});
        } catch (e) {
            console.log(e);
            res.status(400).send({error: e.message});
        }
    }
    async addToFavorites(req, res) {
        try {
            const {id, gender, productId} = req.body;
            if (!gender || !productId) {
                throw new Error('Invalid gender or product ID.');
            }
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found.');
            }
            if (user.favorites[gender].some(item => item === productId)) {
                throw new Error('Product already added to favorites.');
            }
            if (user.favorites[gender].length > 19) {
                throw new Error(`You have exceeded the limit of favorites ${gender}'s clothing(max 20 items)`);
            }
             user.favorites[gender] = [...user.favorites[gender], productId];
            user.save();
            res.status(200).send({
                message: 'Product has been added.', 
                user: {
                    name: user.name,
                    surname: user.surname,
                    phone: user.phone,
                    email: user.email,
                    id: user._id,
                    isActivated: user.isActivated,
                    favorites: user.favorites
                }
            });
        } catch (e) {
            res.status(400).send({ error: e.message });
        }
    }
    async removeFromFavorites(req, res) {
        try {
            const {id, gender, productId} = req.body;
            if (!gender || !productId) {
                throw new Error('Invalid gender or product ID.');
            }
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found.');
            }
            if (!user.favorites[gender].some(item => item === productId)) {
                throw new Error('Product not found in favorites.');
            }
            user.favorites[gender] = user.favorites[gender].filter(item => item !== productId);
            user.save();
            res.status(200).send({
                message: 'Product has been deleted from favorites.', 
                user: {
                name: user.name,
                surname: user.surname,
                phone: user.phone,
                email: user.email,
                id: user._id,
                isActivated: user.isActivated,
                favorites: user.favorites
            }
            });
        } catch (e) {
            res.status(400).send({ error: e.message });
        }
    }
    async getUserFavorites(req, res) {
        try {
            const {id} = req.query;
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found.');
            }
            const men = user.favorites.men.length ? await Promise.all(user.favorites.men.map(async (item) => {
                const product = await Product.men.findById(item);
                if (product) {
                    return product;
                }
            })) : [];
            const women = user.favorites.women.length ? await Promise.all(user.favorites.women.map(async (item) => {
                const product = await Product.women.findById(item);
                if (product) {
                    return product;
                }
            })) : [];
            res.status(200).send({men: [...men], women: [...women]});
        } catch (e) {
            res.status(400).send({error: e.message})
        }
    }
}

module.exports = new ProductController();
