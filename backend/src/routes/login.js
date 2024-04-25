import bcrypt from 'bcrypt'
import { getUser } from '../database/account.js';
import { Router } from 'express';
import { loginUser, logoutUser } from '../auth.js'
import { createErrorObj } from './routeutil.js'

const router = Router()

// Login
// Requires the request body to contain email and password (json)
// Responds with status 400 if login failed (along an error message), otherwise status 200
// On successful login, sets a session corresponding with the user
// login.js route adjustment for multiple logins
router.put('/', async (req, res) => {
    let email = req.body.email
    let password = req.body.password

    // Check if request includes email and password
    if (!email || !password) {
        res.status(400).json(createErrorObj("Email or password field missing from request body"))
        return
    }

    // User already logged in
    // Prevent user from loggin in again (perhaps with a different account) at the same time
    if (req.session.user) {
        res.status(400).json(createErrorObj("Already logged in!"))
        return
    }

    // If user is already signed in, we update their session object in case their password has changed
    try {
        const user = await getUser(email)

        // Check if password matches with the hashed password
        const match = await bcrypt.compare(password, user.hashpass);
        if (!match) {
            res.status(400).json(createErrorObj("Email or password is incorrect"))
            return
        }

        const userWithoutPass = loginUser(req, user)
        res.status(200).json(userWithoutPass)
    } catch(e) {
        console.error(e)
        res.status(400).json(createErrorObj(e))
    }
})

// Logout
// No requirement for the request
// Responds with status 400 or 200
// On successful logout, destroys the session associated with the user and clears the user's cookie
router.delete('/', async (req, res) => {
    console.log(req.session)
    if (!req.session.user) {
        res.status(400).json(createErrorObj("No user logged in"))
        return
    }

    logoutUser(req, res, (err) => {
        if (err) {
            res.status(500).json(createErrorObj(err, "Failed to log out user"))
            return
        }
        res.status(200).json({message: "User has successfully logged out!"})
    })
})

export default router