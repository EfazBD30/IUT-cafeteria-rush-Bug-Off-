// kitchen queue route
// receives orders and starts cooking in background

const express = require('express')
const router = express.Router()
const { sendOrderUpdate } = require('../queue/rabbitmq')

// POST /queue
// order gateway sends orders here
router.post('/queue', async (req, res) => {
    const foodItemId = req.body.foodItemId
    const quantity = req.body.quantity
    const studentId = req.body.studentId
    const orderId = req.body.orderId

    // check that all required fields are present
    if (!foodItemId || !studentId || !orderId) {
        req.app.locals.metrics.errors++
        return res.status(400).json({
            success: false,
            message: "Missing required order information"
        })
    }

    // respond immediately - student should not wait
    // actual cooking happens in background below
    res.status(200).json({
        success: true,
        message: "Order received, preparing...",
        orderId: orderId
    })

    // now start cooking in background
    // we don't await this - it runs on its own
    cookFoodInBackground(orderId, foodItemId, studentId)
})

// this function runs in background after we already responded to the student
async function cookFoodInBackground(orderId, foodItemId, studentId) {
    try {
        // first send "stock verified" update
        await sendOrderUpdate({
            orderId: orderId,
            studentId: studentId,
            status: "Stock Verified",
            message: "Your order stock has been confirmed"
        })

        // small wait before cooking starts
        await waitFor(500)

        // send "in kitchen" update
        await sendOrderUpdate({
            orderId: orderId,
            studentId: studentId,
            status: "In Kitchen",
            message: "Chef is cooking your food now!"
        })

        // simulate cooking time - random between 3 to 7 seconds
        const cookingTime = Math.floor(Math.random() * 4000) + 3000
        await waitFor(cookingTime)

        // cooking done! send final update
        await sendOrderUpdate({
            orderId: orderId,
            studentId: studentId,
            status: "Ready",
            message: "Your food is ready! Come pick it up 🎉"
        })

        console.log(`Order ${orderId} is ready after ${cookingTime}ms`)

    } catch (err) {
        console.log('Background cooking error:', err.message)
    }
}

// simple helper function to wait for some milliseconds
function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = router