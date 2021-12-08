require('dotenv').config()

const express = require('express')
const fs = require('fs')
const https = require('https')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

var bodyParser = require('body-parser')
const { urlencoded } = require('body-parser')

app.use(express.static('public'));
app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');

app.use(express.json())

var urlencodedParser = bodyParser.urlencoded({ extended: false })

//const { auth, requiresAuth } = require('express-openid-connect')
const port = process.env.PORT || 4080;

const baseURL = process.env.APP_URL || `http://localhost:${port}`

/*const config = {
	authRequired: false,
	idpLogout: true,
	auth0Logout: true,
	issuerBaseURL: process.env.ISSUER_BASE_URL,
	baseURL: baseURL,
	clientID: process.env.CLIENT_ID,
	secret: process.env.SECRET,
	clientSecret: process.env.CLIENT_SECRET,
	authorizationParams: {
		response_type: 'code',
	},
}*/

//app.use(auth(config))

app.get('/', (req, res) => {
    res.render('index')
})

const users = []

let refreshTokens = []

app.get('/profile', authentiateToken, (req,res) => {
    res.json(users.filter(user => user.name === req.user.name))
})

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) {
        return res.status(401).send()
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).send()
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send()
        }
        const accessToken = generateAccessToken({ name: user.name })
        res.json({accessToken: accessToken})
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.status(204).send()
})

app.get('/register', (req,res) => {
    res.render('register')
})

app.post('/register', urlencodedParser, async (req, res) => {
    try {
        const hashedPasswod = await bcrypt.hash(req.body.password, 10)
        const user = { 
            name: req.body.name, 
            password: hashedPasswod 
        }
        users.push(user)
        res.status(201).render('profile', {user}) //send()
    } catch {
        res.status(400).send()
    }
})

app.get('/login', (req, res) => {
    res.render('login')
})

function loginUser(user, password) {
    const user = users.find(user => user.name = req.body.name)
    if (user == null) {
        return res.status(400).send('Invalid password or username')
    }
}

app.post('/login', urlencodedParser, async (req, res) => {
    const user = users.find(user => user.name = req.body.name)
    if (user == null) {
        return res.status(400).send('Invalid password or username')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {

            const username = req.body.username
            const user = {
                name: username
            }

            const accessToken = generateAccessToken(user)  //jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            const refreshToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            refreshTokens.push(refreshToken)
            res.json({accessToken: accessToken, refreshToken: refreshToken})
            //res.send('Success')
        } else {
            req.send('Not allowed')
        }
    } catch {
        res.status(400).send()
    }
})

const hostname = '127.0.0.1';

if (!process.env.PORT) {
	https.createServer({
		key: fs.readFileSync(__dirname + '/cert/server.key'),
		cert: fs.readFileSync(__dirname + '/cert/server.cert'),
	}, app)
		.listen(port, () => console.log(`Server running at https://${hostname}:${port}/`))
} else {
	app.listen(port, () => console.log(`Server running on ${baseURL}`))
}

function authentiateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    if (token == null) {
        return res.status(401).send("Not authorised")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send("Forbidden")
        }

        req.user = user
        next()
    })
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

