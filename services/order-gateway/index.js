// order gateway service - main entry point for all orders
// runs on port 3002

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const orderRoutes = require('./routes/order')

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

// track metrics for this service
app.locals.metrics = {
    totalRequests: 0,
    errors: 0,
    totalResponseTime: 0,
    requestCount: 0
}

app.use((req, res, next) => {
    const startTime = Date.now()
    app.locals.metrics.totalRequests++

    res.on('finish', () => {
        const timeTaken = Date.now() - startTime
        app.locals.metrics.totalResponseTime += timeTaken
        app.locals.metrics.requestCount++
    })

    next()
})

app.use('/', orderRoutes)

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "order-gateway",
        port: PORT,
        time: new Date().toISOString()
    })
})

app.get('/metrics', (req, res) => {
    const avgTime = app.locals.metrics.requestCount > 0
        ? Math.round(app.locals.metrics.totalResponseTime / app.locals.metrics.requestCount)
        : 0

    res.status(200).json({
        service: "order-gateway",
        totalRequests: app.locals.metrics.totalRequests,
        totalErrors: app.locals.metrics.errors,
        avgResponseTimeMs: avgTime
    })
})

app.listen(PORT, () => {
    console.log(`Order Gateway running on port ${PORT}`)
})