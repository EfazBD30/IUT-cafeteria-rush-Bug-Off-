// this file listens to rabbitmq for order updates
// when kitchen queue sends an update, we get it here
// then we forward it to the student via websocket

const amqp = require('amqplib')
const { sendUpdateToStudent } = require('../websocket/notifier')

async function startListening() {
    // keep trying to connect until rabbitmq is ready
    let connected = false

    while (!connected) {
        try {
            console.log('Trying to connect to RabbitMQ...')

            // connect to rabbitmq
            const connection = await amqp.connect(
                process.env.RABBITMQ_URL || 'amqp://localhost'
            )

            // create a channel
            const channel = await connection.createChannel()

            // make sure the queue exists
            await channel.assertQueue('order_updates', { durable: true })

            console.log('Listening to RabbitMQ queue: order_updates')

            connected = true

            // start consuming messages from the queue
            channel.consume('order_updates', (msg) => {
                if (msg === null) {
                    return
                }

                try {
                    // parse the message from kitchen queue
                    const orderUpdate = JSON.parse(msg.content.toString())

                    console.log('Received order update:', orderUpdate.orderId, orderUpdate.status)

                    // forward this update to the student via websocket
                    sendUpdateToStudent(orderUpdate.studentId, {
                        type: 'orderUpdate',
                        orderId: orderUpdate.orderId,
                        status: orderUpdate.status,
                        message: orderUpdate.message
                    })

                    // tell rabbitmq we processed this message successfully
                    channel.ack(msg)

                } catch (err) {
                    console.log('Error processing queue message:', err.message)
                    // reject the message so it goes back to queue
                    channel.nack(msg)
                }
            })

            // handle connection closing
            connection.on('close', () => {
                console.log('RabbitMQ connection closed, reconnecting...')
                connected = false
                setTimeout(startListening, 5000)
            })

        } catch (err) {
            console.log('RabbitMQ not ready yet:', err.message)
            console.log('Waiting 5 seconds before retry...')

            // wait 5 seconds before trying again
            await waitFor(5000)
        }
    }
}

function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = { startListening }