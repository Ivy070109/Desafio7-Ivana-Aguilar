import { Router } from 'express'
//import usersModels from '../dao/models/users.model.js'
import usersModel from '../dao/models/users.model.js'

const router = Router()

//middleware de autenticación del admin
const auth = (req, res, next) => {
    try {
        if (req.session.user.admin) {
            if (req.session.user.admin === true) {
                next()
            } else {
                res.status(403).send({ status: 'ERR', data: 'Usuario no admin', role: 'user' })
            }
        } else {
            res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' })
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
}

// cerrar sesion
router.get('/logout', async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            } else {
                res.status(200).send({ status: 'OK', data: "Sesión finalizada" })
            }
        })
    } catch (err) {
        res.status(500).send({ status: "ERR", data: err.message })
    }
})

//pequeña autenticación del admin, utilizaré un middleware para ésto  
router.get('/admin', auth, async (req, res) => {
    try {
        // if (req.session.user.admin === true) {
        //     res.status(200).send({ status: 'OK', role: 'admin'})
        // } else {
        //     res.status(200).send({ status: 'OK', role: `user` })
        // }
        res.status(200).send({ status: 'OK', data: 'Éstos son los datos para el administrador'})
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//login harcodeado de admin
router.post('/login', async (req, res) => {
    try { 
        const { email, password } = req.body

        if(email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
            req.session.user = { username: email, admin: true }
            res.status(200).send({ status: 'OK', data: `Sesión iniciada` })
        } else {
            res.status(401).send({ status: 'ERR', data: `Datos no válidos` })
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body

        const usuarioExistente = await usersModel.findOne({ email })

        if (usuarioExistente) {
            return res.status(400).json({ status: 'ERR', data: 'El correo ya está registrado.' })
        }

        const newUser = new usersModel({
            first_name,
            last_name,
            email,
            age,
            password
        })
        
        await newUser.save()

        res.status(200).json({ status: 'OK', data: 'Usuario registrado' })
    } catch (err) {
        res.status(400).json({ status: 'ERR', data: err.message })
    }
})

export default router
