// this middleware checks redis cache before touching the database
// if redis says stock is 0, we stop right here and save db load

const Redis = require('ioredis')

// connect to redis
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true  // connect করবে যখন দরকার, আগে না
})

redisClient.on('error', (err) => {
    console.log('Redis cache error:', err.message)
    // cache fail করলেও service চালু রাখব
})

redisClient.on('error', (err) => {
    console.log('Redis connection error:', err.message)
})

redisClient.on('connect', () => {
    console.log('Connected to Redis successfully')
})

async function cacheCheck(req, res, next) {
    const foodItemId = req.body.foodItemId

    // if no food item id, skip cache check and let route handle the error
    if (!foodItemId) {
        return next()
    }

    try {
        // check redis for this item's stock
        const cachedStock = await redisClient.get(`stock:${foodItemId}`)

        // if we found something in cache
        if (cachedStock !== null) {
            const stockCount = parseInt(cachedStock)

            // if cache says 0, no need to even call the database
            if (stockCount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Item out of stock"
                })
            }
        }

        // stock is available or not in cache yet, move on
        next()

    } catch (err) {
        // if redis fails, just skip cache and continue
        // we don't want cache failure to break orders
        console.log('Cache check failed, skipping:', err.message)
        next()
    }
}

module.exports = cacheCheck