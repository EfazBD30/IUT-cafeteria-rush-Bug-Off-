// this file sets up the connection to PostgreSQL database
// we use the pg library for this

const { Pool } = require('pg')

// create a connection pool
// pool means we reuse connections instead of creating new ones every time
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'cafeteria',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123'
})

// test the connection when service starts
pool.connect((err, client, release) => {
    if (err) {
        console.log('Error connecting to PostgreSQL:', err.message)
    } else {
        console.log('Connected to PostgreSQL successfully')
        release()
    }
})

module.exports = pool