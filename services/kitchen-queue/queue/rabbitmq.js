// this file handles the rabbitmq connection
// rabbitmq is like a post office - we drop messages here
// and notification hub picks them up

const amqp = require('amqplib')

// we keep one connection and reuse it
let connection = null
let channel = null

async function connectToRabbitMQ() {
    try {
        // connect to rabbitmq server
        connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
        
        // create a channel (like a phone line inside the connection)
        channel = await connection.createChannel()

        // make sure the queue exists - if not, create it
        // durable: true means queue survives even if rabbitmq restarts
        await channel.assertQueue('order_updates', { durable: true })

        console.log('Connected to RabbitMQ successfully')

        return channel

    } catch (err) {
        console.log('RabbitMQ connection failed:', err.message)
        
        // wait 5 seconds and try again
        console.log('Retrying in 5 seconds...')
        setTimeout(connectToRabbitMQ, 5000)
    }
}

async function sendOrderUpdate(orderData) {
    try {
        if (!channel) {
            console.log('No RabbitMQ channel, skipping update')
            return
        }

        // convert the order data to a string before sending
        const message = JSON.stringify(orderData)

        // send the message to the queue
        channel.sendToQueue('order_updates', Buffer.from(message), {
            persistent: true // message survives rabbitmq restart
        })

        console.log('Order update sent to queue:', orderData.orderId)

    } catch (err) {
        console.log('Failed to send order update:', err.message)
    }
}

module.exports = { connectToRabbitMQ, sendOrderUpdate }