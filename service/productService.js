const Product = require('../models/Product');

class ProductService {
    async getProducts(gender, category, brands, types, sortParam, page, range) {
        const instance = Product[gender];
        let dataParam = [
            { $match: {category} },
            { $sort: sortParam },
            { $skip: (page - 1) * 20 },
            { $limit: 20 }
        ];
        let countParam = {category};
        if (range) {
            const rangeArray = range.split('!');
            dataParam.unshift({ $match: { value: { $gte: Number(rangeArray[0]), $lte: Number(rangeArray[1]) } }});
            countParam.value = { $gte: Number(rangeArray[0]), $lte: Number(rangeArray[1]) };
        }
        if (brands) {
            const brandsArray = brands.split('!');
            dataParam.unshift({ $match: { brand: { $in: brandsArray } } });
            countParam.brand = { $in: brandsArray } ;
        }
        if (types) {
            const typesArray = types.split('!');
            dataParam.unshift({ $match: { type: { $in: typesArray } } });
            countParam.type = { $in: typesArray };
        }
        const data = await instance.aggregate(dataParam);
        const totalCount = await instance.countDocuments(countParam);
        return {
            data,
            totalCount
        }
    }
    async getSale(gender, page, sortParam, brands, types, categoryFilters, range) {
        const brandsArray = brands ? brands.split('!') : null;
        const typesArray = types ? types.split('!') : null;
        const categoriesArray = categoryFilters ? categoryFilters.split('!') : null;
        const rangeArray = range ? range.split('!') : null;
        let countParam = { 'isSale.flag': true };
        let matchParam = [
            { $match: { "isSale.flag": true } },
            { $sort: sortParam },
            { $skip: (page - 1) * 20 },
            { $limit: 20 }
        ]
        if (rangeArray) {
            countParam.value = { $gte: Number(rangeArray[0]), $lte: Number(rangeArray[1]) };
            matchParam.unshift({ $match: { value: { $gte: Number(rangeArray[0]), $lte: Number(rangeArray[1]) } } });
        }
        if (categoriesArray) {
            countParam.category = { $in: categoriesArray };
            matchParam.unshift({ $match: { category: { $in: categoriesArray } } });
        }
        if (brandsArray) {
            countParam.brand = { $in: brandsArray };
            matchParam.unshift({ $match: { brand: { $in: brandsArray } } });
        }
        if (typesArray) {
            countParam.type = { $in: typesArray }
            matchParam.unshift({ $match: { type: { $in: typesArray } } });
        }
        const instance = await Product[gender];
        const data = await instance.aggregate(matchParam);
        const totalCount = await instance.countDocuments(countParam);
        return {
            data,
            totalCount
        }
    }
    async createFilterStats(gender, category, brands, types, sale, categoryFilters, range) {
        const instance = Product[gender];
        const brandsArray = brands ? brands.split('!') : null;
        const typesArray = types ? types.split('!') : null;
        const rangeArray = range ? range.split('!') : null;
        const categoryArray = categoryFilters ? categoryFilters.split('!') : null;
        let categoryParams = [
            {
                $group: {
                    _id: { category: "$category" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.category": 1 }
            }
        ];
        let typeParams = [
            {
                $group: {
                    _id: { type: "$type" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.type": 1 }
            }
        ];
        let brandParams = [
            {
                $group: {
                    _id: { brand: "$brand" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.brand": 1 }
            }
        ];
        let valueRangeParams = [
            {$group: {_id: null, min: {$min: "$value"}, max: {$max: "$value"}}},
            {$project: {_id: 0, min: 1, max: 1}}
        ];
        if (rangeArray) {
            typeParams.unshift({ $match: { value: { $gte: Number(rangeArray[0]), $lte: Number(rangeArray[1]) } } });
            brandParams.unshift({ $match: { value: { $gte: Number(rangeArray[0]), $lte: Number(rangeArray[1]) } } });
            categoryParams.unshift({ $match: { value: { $gte: Number(rangeArray[0]), $lte: Number(rangeArray[1]) } } });
        }
        if (category) {
            typeParams.unshift({$match: {category}});
            brandParams.unshift({$match: {category}});
            valueRangeParams.unshift({$match: {category}});
        }
        if (sale) {
            typeParams.unshift({$match: {'isSale.flag': true}});
            brandParams.unshift({$match: {'isSale.flag': true}});
            valueRangeParams.unshift({$match: {'isSale.flag': true}});
            categoryParams.unshift({$match: {'isSale.flag': true}});
            if (categoryArray) {
                typeParams.unshift({$match: {category: {$in: categoryArray}}});
                brandParams.unshift({$match: {category: {$in: categoryArray}}});
                valueRangeParams.unshift({$match: {category: {$in: categoryArray}}});
            }
        }
        if (brandsArray) {
            typeParams.unshift({$match: {brand: {$in: brandsArray}}});
            valueRangeParams.unshift({$match: {brand: {$in: brandsArray}}});
            categoryParams.unshift({$match: {brand: {$in: brandsArray}}});
        }
        if (typesArray) {
            brandParams.unshift({$match: {type: {$in: typesArray}}});
            valueRangeParams.unshift({$match: {type: {$in: typesArray}}});
            categoryParams.unshift({$match: {type: {$in: typesArray}}});
        }
        if (brandsArray && typesArray) {
            typeParams.unshift({$match: {type: {$in: typesArray}}});
            brandParams.unshift({$match: {brand: {$in: brandsArray}}});
        }
        const categoryStats = sale ? await instance.aggregate(categoryParams) : null;
        const brandStats = await instance.aggregate(brandParams);
        const typeStats = await instance.aggregate(typeParams);
        const valueRange = await instance.aggregate(valueRangeParams);
        return {brandStats, typeStats, valueRange, categoryStats};
    }
}

module.exports = new ProductService();
