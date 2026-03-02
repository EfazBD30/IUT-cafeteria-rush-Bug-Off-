// this file listens to rabbitmq for order updates
// when kitchen queue sends an update, we get it here
// then we forward it to the student via websocket

const amqp = require('amqplib')
const { sendUpdateToStudent } = require('../websocket/notifier')

let connection = null
let channel = null
let retryCount = 0
const MAX_RETRIES = 10

async function startListening() {
    // keep trying to connect until rabbitmq is ready
    while (retryCount < MAX_RETRIES) {
        try {
            console.log(`Trying to connect to RabbitMQ (attempt ${retryCount + 1}/${MAX_RETRIES})...`)

            // connect to rabbitmq
            connection = await amqp.connect(
                process.env.RABBITMQ_URL || 'amqp://localhost'
            )

            // create a channel
            channel = await connection.createChannel()

            // make sure the queue exists
            await channel.assertQueue('order_updates', { durable: true })

            console.log('✅ Listening to RabbitMQ queue: order_updates')
            
            // reset retry count on successful connection
            retryCount = 0

            // start consuming messages from the queue
            channel.consume('order_updates', (msg) => {
                if (msg === null) {
                    return
                }

                try {
                    // parse the message from kitchen queue
                    const orderUpdate = JSON.parse(msg.content.toString())

                    console.log('📦 Received order update:', orderUpdate.orderId, orderUpdate.status)

                    // forward this update to the student via websocket
                    sendUpdateToStudent(orderUpdate.studentId, {
                        type: 'orderUpdate',
                        orderId: orderUpdate.orderId,
                        status: orderUpdate.status,
                        message: orderUpdate.message,
                        timestamp: new Date().toISOString()
                    })

                    // tell rabbitmq we processed this message successfully
                    channel.ack(msg)

                } catch (err) {
                    console.log('❌ Error processing queue message:', err.message)
                    // reject the message so it goes back to queue
                    channel.nack(msg)
                }
            })

            // handle connection closing
            connection.on('close', () => {
                console.log('⚠️ RabbitMQ connection closed, reconnecting...')
                channel = null
                connection = null
                setTimeout(startListening, 5000)
            })

            connection.on('error', (err) => {
                console.log('🔴 RabbitMQ connection error:', err.message)
            })

            // exit the while loop since we're connected
            break

        } catch (err) {
            console.log('⏳ RabbitMQ not ready yet:', err.message)
            retryCount++
            
            if (retryCount < MAX_RETRIES) {
                console.log(`Waiting 5 seconds before retry... (${retryCount}/${MAX_RETRIES})`)
                await waitFor(5000)
            } else {
                console.log('❌ Max retries reached. RabbitMQ connection failed.')
                console.log('Will continue retrying in background...')
                // continue retrying but don't block
                setTimeout(startListening, 10000)
            }
        }
    }
}

function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// cleanup function
async function closeConnections() {
    if (channel) {
        await channel.close()
    }
    if (connection) {
        await connection.close()
    }
    console.log('RabbitMQ connections closed')
}

module.exports = { startListening, closeConnections }