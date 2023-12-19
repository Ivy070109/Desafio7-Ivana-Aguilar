import { Router } from "express"
import CartManager from "../dao/database/CartManager.js"
//import ProductManager from '../dao/database/ProductManager.js'

const cart = new CartManager()
//const product = new ProductManager()
const router = Router()

//crear carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cart.addCarts()
        return res.status(200).send({ status: "OK", data: newCart })    
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//ver todos los carritos
router.get('/', async (req, res) => {
    try {
        const carts = await cart.getCarts()
    
        return res.status(200).send({ status: "OK", data: carts })    
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//obtener carrito por id
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const foundCart = await cart.getCartById(cid)
    
        return res.status(200).send({ status: "OK", data: foundCart })    
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//agregar producto en carrito
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { quantity } = req.body

        const result = await cart.addProductInCart(cid, { _id: pid, quantity: quantity })
        return res.status(200).send({ status: 'OK', data: result })

    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//actualizar cantidad de productos
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params 
        const { quantity } = req.body 

        const aggregateProduct = await cart.addProductInCart(cid, { _id: pid, quantity: quantity })
        res.status(200).send({ status: 'OK', data: aggregateProduct })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//eliminar carrito por id
router.delete('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid
        const response = await cart.deleteCart(cid)

        if (response === true) {
            res.status(200).send({ message: 'Carrito eliminado', cart: response })
        } else {
            res.status(404).send({ message: 'Carrito no encontrado', response })
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//eliminar del carrito el producto seleccionado
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const productDelete = await cart.deleteProductById(cid, pid)

        return res.status(200).send({ message: `El producto se eliminó`, data: productDelete })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

export default router