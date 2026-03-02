// handles all stock related operations
const express = require('express')
const router = express.Router()
const pool = require('../db/postgres')
const Redis = require('ioredis')

// connect to redis
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true,
    retryStrategy: function(times) {
        return Math.min(times * 50, 2000)
    }
})

redisClient.on('error', (err) => {
    console.log('⚠️ Redis error in stock service:', err.message)
})

// POST /deduct
router.post('/deduct', async (req, res) => {
    const foodItemId = req.body.foodItemId
    const quantity = req.body.quantity || 1

    if (!foodItemId) {
        req.app.locals.metrics.errors++
        return res.status(400).json({
            success: false,
            message: "foodItemId is required"
        })
    }

    const client = await pool.connect()
    
    try {
        await client.query('BEGIN')

        // ✅ FIXED: Use FOR UPDATE to lock the row
        const selectQuery = `
            SELECT id, name, stock_count, version 
            FROM food_items 
            WHERE id = $1 
            FOR UPDATE
        `
        const selectResult = await client.query(selectQuery, [foodItemId])

        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK')
            req.app.locals.metrics.errors++
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            })
        }

        const foodItem = selectResult.rows[0]
        const currentStock = foodItem.stock_count
        const currentVersion = foodItem.version

        if (currentStock < quantity) {
            await client.query('ROLLBACK')
            req.app.locals.metrics.errors++
            return res.status(400).json({
                success: false,
                message: "Out of stock"
            })
        }

        const newStock = currentStock - quantity
        const newVersion = currentVersion + 1

        const updateQuery = `
            UPDATE food_items 
            SET stock_count = $1, version = $2
            WHERE id = $3 AND version = $4
        `
        const updateResult = await client.query(updateQuery, [
            newStock,
            newVersion,
            foodItemId,
            currentVersion
        ])

        if (updateResult.rowCount === 0) {
            await client.query('ROLLBACK')
            req.app.locals.metrics.errors++
            return res.status(409).json({
                success: false,
                message: "Someone else ordered at the same time, try again"
            })
        }

        await client.query('COMMIT')

        // update redis cache
        try {
            await redisClient.set(`stock:${foodItemId}`, newStock.toString())
        } catch (redisErr) {
            console.log('⚠️ Redis update failed:', redisErr.message)
        }

        res.status(200).json({
            success: true,
            message: "Stock deducted successfully",
            foodItemId: foodItemId,
            remainingStock: newStock
        })

    } catch (err) {
        await client.query('ROLLBACK')
        req.app.locals.metrics.errors++
        console.log('❌ Stock deduction error:', err.message)
        res.status(500).json({
            success: false,
            message: "Database error occurred"
        })
    } finally {
        client.release()
    }
})

// GET /stock/:itemId
router.get('/stock/:itemId', async (req, res) => {
    const itemId = req.params.itemId

    try {
        const result = await pool.query(
            'SELECT id, name, stock_count, price FROM food_items WHERE id = $1',
            [itemId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            })
        }

        const item = result.rows[0]

        res.status(200).json({
            success: true,
            foodItem: {
                id: item.id,
                name: item.name,
                stockCount: item.stock_count,
                price: item.price
            }
        })

    } catch (err) {
        req.app.locals.metrics.errors++
        console.log('❌ Error fetching stock:', err.message)
        res.status(500).json({
            success: false,
            message: "Could not fetch stock info"
        })
    }
})

module.exports = router