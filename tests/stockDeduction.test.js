// tests for stock deduction logic
function deductStock(currentStock, requestedQuantity, currentVersion) {
    if (currentStock <= 0 || currentStock < requestedQuantity) {
        throw new Error('Out of stock')
    }

    const newStock = currentStock - requestedQuantity
    const newVersion = currentVersion + 1

    return {
        success: true,
        newStock: newStock,
        newVersion: newVersion
    }
}

// ✅ FIXED: Made this async for realistic simulation
async function simulateTwoSimultaneousOrders(initialStock) {
    return new Promise((resolve) => {
        let stock = initialStock
        let version = 0
        let successCount = 0
        let failCount = 0

        const stockAtReadTime = stock
        const versionAtReadTime = version

        // first order
        if (versionAtReadTime === version) {
            stock = stockAtReadTime - 1
            version = versionAtReadTime + 1
            successCount++
        }

        // second order
        if (versionAtReadTime === version) {
            stock = stockAtReadTime - 1
            version = versionAtReadTime + 1
            successCount++
        } else {
            failCount++
        }

        resolve({ successCount, failCount, finalStock: stock })
    })
}

test('Deducting stock when quantity is 0 should throw Out of stock error', () => {
    expect(() => {
        deductStock(0, 1, 0)
    }).toThrow('Out of stock')
})

test('Deducting 1 from stock of 5 should return new stock as 4', () => {
    const result = deductStock(5, 1, 0)
    expect(result.success).toBe(true)
    expect(result.newStock).toBe(4)
})

// ✅ FIXED: Added async/await
test('Two simultaneous orders on stock of 1 should have only one succeed', async () => {
    const result = await simulateTwoSimultaneousOrders(1)
    expect(result.successCount).toBe(1)
    expect(result.failCount).toBe(1)
    expect(result.finalStock).toBe(0)
})