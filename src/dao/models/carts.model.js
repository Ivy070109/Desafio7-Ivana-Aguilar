import mongoose from 'mongoose'
//hay que importar el model de productos porque los vamos a utilizar para el populate

mongoose.pluralize(null)

const collection = "carts"

const schema = new mongoose.Schema({
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products"
                },
                quantity: Number, 
                _id: false,
            }
        ],
        default: []
    }
    
})

//populate
schema.pre('find', function(){
    this.populate('products.product')
})


const model = mongoose.model(collection, schema)
export default model