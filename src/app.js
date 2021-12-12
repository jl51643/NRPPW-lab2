require('dotenv').config()

const express = require('express')
const fs = require('fs')
const https = require('https')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const auth = require('./auth');
const db = require('./database/data')

const { check } = require('express-validator')

//const sanitize = require('sanitize')

//const sanitizeHtml = require('sanitize-html')

var bodyParser = require('body-parser')
const { urlencoded } = require('body-parser')
const { receiveMessageOnPort } = require('worker_threads')
const { equal } = require('assert')

app.use(express.static('public'));
app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');

app.use(express.json())

app.use(auth.verifyToken)

//var urlencodedParser = bodyParser.urlencoded({ extended: false })

var secure = true

const port = process.env.PORT || 4080;

const baseURL = process.env.APP_URL || `http://localhost:${port}`

const users = []
let refreshTokens = []

app.get('/', async (req, res) => {
    const pictures = await db.getAllPictures()
    res.render('client', {secure:secure, pictures: pictures})
})

app.post('/secure', async (req, res) => {
    secure = !secure
    const users = await db.clearUsers()
    const pictures = await db.clearPictures()
    res.json(secure)
})

app.post('/register', async (req, res) => {

    try {
        const exists = await db.getUser(req.body.username)
        console.log(exists)

        if (exists.length > 0) {
            return res.status(400).send("User already eists")
        }

        let password = ""

        if (secure) {
            const hashedPasswod = await bcrypt.hash(req.body.password, 10)
            password = hashedPasswod
        } else {
            password = req.body.password
        }
        const user = {
            username: req.body.username,
            password: password
        }
        const newUser = await db.createUser({ username: user.username, password: user.password })
        res.status(201).send()
    } catch {
        res.status(400).send()
    }
})

app.post('/login', async (req, res) => {

    try {

        const exists = await db.getUser(req.body.username)

        if (exists == null) {
            return res.status(400).send('Invalid password or username')
        }

        let accessPremission = false

        if (secure) {
            accessPremission = await bcrypt.compare(req.body.password, exists[0].password)
        } else {
            accessPremission = 0 == req.body.password.localeCompare(exists[0].password)
        }

        if (accessPremission) {
            const username = req.body.username

            const payload = {
                username
            }
            
            const token = auth.generateAccessToken(payload)
            res.json(token)

        } else {
            req.send('Not allowed')
        }
    } catch {
        res.status(400).send()
    }
})



app.get('/protected', auth.authenticationNeeded, async (req, res) => {
    const userdb = await db.getUser(req.user.username)
    const user = {usename: userdb[0].username, password: userdb[0].password}
    res.json(user)
})

app.post('/pictures', 
            auth.authenticationNeeded, 
            unsecureMiddleware, 
            [check('picture.src').escape(), check('picture.name').escape()],  
            async(req, res) => {
    const picture = await db.createPicture(req.body.picture)
})

app.get('/pictures', auth.authenticationNeeded, async(req, res) => {
    const pictures = await db.getAllPictures()
    res.json(pictures)
})


const hostname = '127.0.0.1';

// if (!process.env.PORT) {
// 	https.createServer({
// 		key: fs.readFileSync(__dirname + '/cert/server.key'),
// 		cert: fs.readFileSync(__dirname + '/cert/server.cert'),
// 	}, app)
// 		.listen(port, () => console.log(`Server running at https://${hostname}:${port}/`))
// } else {
// 	app.listen(port, () => console.log(`Server running on ${baseURL}`))
// }

app.listen(port, () => console.log(`Server running on ${baseURL}`))

async function unsecureMiddleware(req, res, next) {
    if (secure) {
        next()
    } else {
        const picture = await db.createPicture(req.body.picture)
    }
}