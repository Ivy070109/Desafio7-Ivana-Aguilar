import passport from 'passport'
import LocalStrategy from 'passport-local'
import GithubStrategy from 'passport-github2'
import userModel from '../dao/models/users.model.js'
import { createHash, isValidPassword } from '../utils.js'

const initPassport = () => {
    //función de verificación de registro
    const verifyRegistration = async (req, username, password, done) => {
        try {
            const { first_name, last_name, email, gender } = req.body

            if (!first_name || !last_name || !email || !gender) {
                return done('Se requieren los campos completos', false)
            }

            const user = await userModel.findOne({ email: username })

            if (user) return done(null, false)
            
            const newUser = {
                first_name,
                last_name,
                email,
                gender,
                password: createHash(password)
            }

            const process = await userModel.create(newUser)

            return done(null, process)
        } catch (err) {
            return done(`Error passport local: ${err.message}`)
        }
    }

    //función para la restauración de la contraseña
    const verifyRestoration = async (req, username, password, done) => {
        try {
            if (username.length === 0 || password.length === 0) {
                return done('Se requieren los campos completos', false)
            } 

            const user = await userModel.findOne({ email: username })
            if (!user) return done(null, false)

            const process = await userModel.findOneAndUpdate({ email: username }, { password: createHash(password) })

            return done(null, process)
        } catch(err) {
            return done(`Error passport local: ${err.message}`)
        }
    }

    //función para autenticación de github
    const verifyGithub = async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await userModel.findOne({ email: profile._json.email })

            if (!user) {
                const name_parts = profile._json.name.split(' ')
                const newUser = {
                    first_name: name_parts[0],
                    last_name: name_parts[1],
                    email: profile._json.email,
                    gender: 'NA',
                    password: ' '
                }
    
                const process = await userModel.create(newUser)
    
                return done(null, process)
            } else {
                done(null, user)
            }
        } catch (err) {
            return done(`Error passport Github: ${err.message}`)
        }
    }
    
    //estrategia local de autenticación de registro
    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password'
    }, verifyRegistration))
    
    //estrategia local de autenticación de restauración de contraseña
    passport.use('restore', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password'
    }, verifyRestoration))

    //estrategia para autenticación externa con github
    passport.use('github', new GithubStrategy({
        clientID: 'Iv1.d498843df2658f56',
        clientSecret: '76f633ec2843bf9b4d1def140db7473b4096ee53',
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
    }, verifyGithub))


    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    
    passport.deserializeUser(async (id, done) => {
        try {
            done(null, await userModel.findById(id))
        } catch (err) {
            done(err.message)
        }
    })
}

export default initPassport
