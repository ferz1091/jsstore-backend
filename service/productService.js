const Product = require('../models/Product');

class ProductService {
    async getProducts(gender, category, brands, types, sortParam, page) {
        const instance = Product[gender];
        let data = null;
        let totalCount = null;
        if (brands && !types) {
            const brandsArray = brands.split('!');
            data = await instance.aggregate([
                { $match: { category: category } },
                { $match: { brand: { $in: brandsArray } } },
                { $sort: sortParam },
                { $skip: (page - 1) * 20 },
                { $limit: 20 }
            ]);
            totalCount = await instance.countDocuments({
                $and: [
                    { category: category },
                    { brand: { $in: brands } }
                ]
            });
        } else if (!brands && types) {
            const typesArray = types.split('!');
            data = await instance.aggregate([
                { $match: { category: category } },
                { $match: { type: { $in: typesArray } } },
                { $sort: sortParam },
                { $skip: (page - 1) * 20 },
                { $limit: 20 }
            ]);
            totalCount = await instance.countDocuments({
                $and: [
                    { category: category },
                    { type: { $in: typesArray } }
                ]
            });
        } else if (!brands && !types) {
            data = await instance.aggregate([
                { $match: { category: category } },
                { $sort: sortParam },
                { $skip: (page - 1) * 20 },
                { $limit: 20 }
            ]);
            totalCount = await instance.countDocuments({category});
        } else {
            const brandsArray = brands.split('!');
            const typesArray = types.split('!');
            data = await instance.aggregate([
                { $match: { category: category } },
                { $match: { brand: { $in: brandsArray } } },
                { $match: { type: { $in: typesArray } } },
                { $sort: sortParam },
                { $skip: (page - 1) * 20 },
                { $limit: 20 }
            ]);
            totalCount = await instance.countDocuments({
                $and: [
                    { category: category },
                    { brand: { $in: brands } },
                    { type: { $in: typesArray } }
                ]
            });
        }
        return {
            data,
            totalCount
        }
    }
    async createFilterStats(gender, category, brands, types, sortParam) {
        const instance = Product[gender];
        let typeStats = null;
        let brandStats = null;
        let valueRange = null;
        if (brands && !types) {
            const brandsArray = brands.split('!');
            typeStats = await instance.aggregate([
                {
                    $match: {
                        $and: [
                            { category },
                            { brand: { $in: brandsArray } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: { type: "$type" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.type": 1 }
                }
            ]);
            valueRange = await instance.aggregate([
                {
                    $match: {
                        $and: [
                            { category },
                            { brand: { $in: brandsArray } }
                        ]
                    } 
                },
                { $group: { _id: null, min: { $min: "$value" }, max: { $max: "$value" } } },
                { $project: { _id: 0, min: 1, max: 1 } }
            ]);
        } else if (types && !brands) {
            const typesArray = types.split('!');
            brandStats = await instance.aggregate([
                {
                    $match: {
                        $and: [
                            { category },
                            { type: { $in: typesArray } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: { brand: "$brand" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.brand": 1 }
                }
            ]);
            valueRange = await instance.aggregate([
                {
                    $match: {
                        $and: [
                            { category },
                            { type: { $in: typesArray } }
                        ]
                    }
                },
                { $group: { _id: null, min: { $min: "$value" }, max: { $max: "$value" } } },
                { $project: { _id: 0, min: 1, max: 1 } }
            ]);
        } else if (!types && !brands) {
            typeStats = await instance.aggregate([
                {
                    $match: { category }
                },
                {
                    $group: {
                        _id: { type: "$type" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.type": 1 }
                }
            ]);
            brandStats = await instance.aggregate([
                {
                    $match: { category }
                },
                {
                    $group: {
                        _id: { brand: "$brand" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.brand": 1 }
                }
            ]);
            valueRange = await instance.aggregate([
                { $match: { category } },
                { $group: { _id: null, min: { $min: "$value" }, max: { $max: "$value" } } },
                { $project: { _id: 0, min: 1, max: 1 } }
            ]);
        } else {
            const brandsArray = brands.split('!');
            const typesArray = types.split('!');
            typeStats = await instance.aggregate([
                {
                    $match: {
                        $and: [
                            { category },
                            { brand: { $in: brandsArray } },
                            { type: { $in: typesArray } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: { type: "$type" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.type": 1 }
                }
            ]);
            brandStats = await instance.aggregate([
                {
                    $match: {
                        $and: [
                            { category },
                            { type: { $in: typesArray } },
                            { brand: { $in: brandsArray } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: { brand: "$brand" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.brand": 1 }
                }
            ]);
            valueRange = await instance.aggregate([
                {
                    $match: {
                        $and: [
                            { category },
                            { type: { $in: typesArray } },
                            { brand: { $in: brandsArray } }
                        ]
                    }
                },
                { $group: { _id: null, min: { $min: "$value" }, max: { $max: "$value" } } },
                { $project: { _id: 0, min: 1, max: 1 } }
            ]);
        }
        return {brandStats, typeStats, valueRange};
    }
}

module.exports = new ProductService();
