const Product = require('../models/Product');

module.exports = function defineProductType(type) {
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
