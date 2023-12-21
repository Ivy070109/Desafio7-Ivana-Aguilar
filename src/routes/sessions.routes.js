import { Router } from 'express'
import usersModel from '../dao/models/users.model.js'
//importo las funciones de bcrypt
import { createHash, isValidPassword } from '../utils.js'
//importar de passport
import passport from 'passport'
//importamos el congif de passport
import initPassport from '../config/passport.config.js'

//inicializo la estrategia de passport
initPassport()
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
                //res.status(200).send({ status: 'OK', data: "Sesión finalizada" })
                res.redirect('/login')
            }
        })
    } catch (err) {
        res.status(500).send({ status: "ERR", data: err.message })
    }
})

//pequeña autenticación del admin, utilizaré un middleware para ésto  
router.get('/admin', auth, async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Éstos son los datos para el administrador'})
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//para hashear passwords pasados
router.get('/hash/:pass', async (req, res) => {
    res.status(200).send({ status: 'OK', data: createHash(req.params.pass) })
})

//endpoint de fail
router.get('/failregister', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'El usuario ya existe o faltan completar campos obligatorios' })
})

//Dejaré de utilizar el código harcodeado, reemplazare la autentificación con base de datos
router.post('/login', async (req, res) => {
    try { 
        const { email, password } = req.body

        const userInDb = await usersModel.findOne({ email: email })

        if (userInDb !== null && isValidPassword(userInDb, password)) {
            req.session.user = { username: email, admin: true } 
            res.redirect('/products')
        } else {
            res.status(401).send({ status: 'ERR', data: `Datos no válidos` })
        } 
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

//register con password plano
/*
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body

        const userExists = await usersModel.findOne({ email })
        if (userExists) {
            return res.status(401).json({ status: 'ERR', data: 'El correo ya está registrado' })
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
*/

//register con passport
router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister'}), async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Usuario registrado' })
    } catch(err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.post('/restore', passport.authenticate('restore', { failureRedirect: '/api/sessions/failrestore' }), async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: "Contraseña actualizada" })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

export default router
