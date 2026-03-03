// this middleware checks redis cache before touching the database
// if redis says stock is 0, we stop right here and save db load

const Redis = require('ioredis')

// ✅ FIXED: Better Redis connection with error handling
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true,  // don't connect until we need it
    retryStrategy: function(times) {
        // retry with backoff, max 2 seconds
        return Math.min(times * 50, 2000)
    }
})

redisClient.on('error', (err) => {
    console.log('⚠️ Redis connection error (cache check):', err.message)
    console.log('Cache will be skipped until Redis recovers')
})

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis successfully (cache check)')
})

async function cacheCheck(req, res, next) {
    const foodItemId = req.body.foodItemId

    if (!foodItemId) {
        return next()
    }

    try {
        // check redis for this item's stock
        const cachedStock = await redisClient.get(`stock:${foodItemId}`)

        if (cachedStock !== null) {
            const stockCount = parseInt(cachedStock)

            if (stockCount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Item out of stock"
                })
            }
        }

        next()

    } catch (err) {
        // if redis fails, just skip cache and continue
        console.log('⚠️ Cache check failed, skipping:', err.message)
        next()
    }
}

module.exports = cacheCheck