// this is where the actual order processing happens
// auth and cache checks already passed by the time we get here

const express = require('express')
const router = express.Router()
const axios = require('axios')
const authCheck = require('../middleware/authCheck')
const cacheCheck = require('../middleware/cacheCheck')

// POST /order
// student places a food order
router.post('/order', authCheck, cacheCheck, async (req, res) => {
    const foodItemId = req.body.foodItemId
    const quantity = req.body.quantity || 1
    const studentId = req.student.studentId

    // make sure food item id was provided
    if (!foodItemId) {
        req.app.locals.metrics.errors++
        return res.status(400).json({
            success: false,
            message: "Please provide a foodItemId"
        })
    }

    try {
        // step 1: call stock service to deduct the item
        const stockResponse = await axios.post(
            `${process.env.STOCK_SERVICE_URL}/deduct`,
            {
                foodItemId: foodItemId,
                quantity: quantity
            }
        )

        // if stock service said no, relay that message
        if (!stockResponse.data.success) {
            req.app.locals.metrics.errors++
            return res.status(400).json({
                success: false,
                message: stockResponse.data.message
            })
        }

        // step 2: send order to kitchen queue
        const kitchenResponse = await axios.post(
            `${process.env.KITCHEN_SERVICE_URL}/queue`,
            {
                foodItemId: foodItemId,
                quantity: quantity,
                studentId: studentId,
                orderId: `order_${Date.now()}`
            }
        )

        // everything went well
        res.status(200).json({
            success: true,
            message: "Order placed successfully!",
            orderId: kitchenResponse.data.orderId,
            status: "Pending"
        })

    } catch (err) {
        req.app.locals.metrics.errors++
        console.log('Order processing error:', err.message)

        if (err.response && err.response.status === 400) {
            return res.status(400).json({
                success: false,
                message: err.response.data.message || "Stock error"
            })
        }

        res.status(500).json({
            success: false,
            message: "Something went wrong, please try again"
        })
    }
})

module.exports = router