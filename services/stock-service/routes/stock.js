// handles all stock related operations
// deducting stock and checking current stock levels

const express = require('express')
const router = express.Router()
const pool = require('../db/postgres')
const Redis = require('ioredis')

// connect to redis so we can update cache after stock changes
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
})

// POST /deduct
// called by order gateway when a student places an order
router.post('/deduct', async (req, res) => {
    const foodItemId = req.body.foodItemId
    const quantity = req.body.quantity || 1

    // make sure food item id is provided
    if (!foodItemId) {
        req.app.locals.metrics.errors++
        return res.status(400).json({
            success: false,
            message: "foodItemId is required"
        })
    }

    try {
        // we use optimistic locking here
        // optimistic locking means: read the row, remember its version number
        // then when updating, check if version is still the same
        // if two orders come at the same time, only one will win

        // step 1: get the current stock and version number
        const selectQuery = `
            SELECT id, name, stock_count, version 
            FROM food_items 
            WHERE id = $1
        `
        const selectResult = await pool.query(selectQuery, [foodItemId])

        // check if food item exists
        if (selectResult.rows.length === 0) {
            req.app.locals.metrics.errors++
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            })
        }

        const foodItem = selectResult.rows[0]
        const currentStock = foodItem.stock_count
        const currentVersion = foodItem.version

        // check if enough stock available
        if (currentStock < quantity) {
            req.app.locals.metrics.errors++
            return res.status(400).json({
                success: false,
                message: "Out of stock"
            })
        }

        // step 2: try to update the stock
        // the WHERE clause checks version - if version changed, this update affects 0 rows
        const newStock = currentStock - quantity
        const newVersion = currentVersion + 1

        const updateQuery = `
            UPDATE food_items 
            SET stock_count = $1, version = $2
            WHERE id = $3 AND version = $4
        `
        const updateResult = await pool.query(updateQuery, [
            newStock,
            newVersion,
            foodItemId,
            currentVersion
        ])

        // if 0 rows updated, someone else grabbed the stock at the same time
        if (updateResult.rowCount === 0) {
            req.app.locals.metrics.errors++
            return res.status(409).json({
                success: false,
                message: "Order conflict, please try again"
            })
        }

        // step 3: update redis cache with new stock number
        await redisClient.set(`stock:${foodItemId}`, newStock.toString())

        res.status(200).json({
            success: true,
            message: "Stock deducted successfully",
            foodItemId: foodItemId,
            remainingStock: newStock
        })

    } catch (err) {
        req.app.locals.metrics.errors++
        console.log('Stock deduction error:', err.message)
        res.status(500).json({
            success: false,
            message: "Database error occurred"
        })
    }
})

// GET /stock/:itemId
// check how much stock is left for a food item
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
        console.log('Error fetching stock:', err.message)
        res.status(500).json({
            success: false,
            message: "Could not fetch stock info"
        })
    }
})

module.exports = router