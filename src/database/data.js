const knex = require('knex')
const config = require('../knexfile')
const db = knex(config.development)

function createUser(user) {
    return db("users").insert(user)
    //return knex("users").insert(user)
}

function getAllUsers() {
    return db("users").select("*")
}

function getUser(username) {
    return db("users").where("username", username)
}

function createPicture(picture) {
    return db("pictures").insert(picture)
}

function getAllPictures() {
    return db("pictures").select("*")
}

function clearUsers() {
    return db("users").delete().where(true)
}

function clearPictures() {
    return db("pictures").delete().where(true)
}


module.exports = {
    createUser,
    getAllUsers,
    getUser,
    createPicture,
    getAllPictures,
    clearUsers,
    clearPictures
}