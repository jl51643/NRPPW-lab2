// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/dev.sqlite3'
    },
    useNullAsDefault: true
  },
};

// const knex = require("knex")

// const conn = knex({
//     client: "sqlite3",
//     connection : {
//         filename: "./data/users.db3"
//     }
// })

// module.exports = conn
