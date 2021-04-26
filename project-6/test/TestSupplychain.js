// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const SupplyChain = artifacts.require('SupplyChain')
const truffleAssert = require('truffle-assertions')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei('1', "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Add originFarmerID to farmer roles
        await supplyChain.addFarmer(originFarmerID)

        // Mark an item as Harvested by calling function harvestItem()
        const tx = await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], 0, 'Error: Product price is not 0')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], emptyAddress, 'Error: Init distributor is not empty')
        assert.equal(resultBufferTwo[7], emptyAddress, 'Error: Init retailer is not empty')
        assert.equal(resultBufferTwo[8], emptyAddress, 'Error: Init consumer is not empty')

        // https://kalis.me/check-events-solidity-smart-contract-test-truffle/
        // https://www.trufflesuite.com/docs/truffle/getting-started/interacting-with-your-contracts#catching-events
        truffleAssert.eventEmitted(tx, 'Harvested', (ev) => {
            return true;
        }, 'Harvested() event not emitted')
    })

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        // process
        const tx = await supplyChain.processItem(upc, { from: originFarmerID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')

        truffleAssert.eventEmitted(tx, 'Processed', (ev) => {
            return true;
        }, 'Processed() event not emitted')
    })

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        // process
        await supplyChain.processItem(upc, { from: originFarmerID })

        // pack
        const tx = await supplyChain.packItem(upc, { from: originFarmerID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')

        truffleAssert.eventEmitted(tx, 'Packed', (ev) => {
            return true;
        }, 'Packed() event not emitted')
    })

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        // process
        await supplyChain.processItem(upc, { from: originFarmerID })

        // pack
        await supplyChain.packItem(upc, { from: originFarmerID })

        // sell
        const tx = await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[4], productPrice, 'Error: ProductPrice not matching')
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')

        truffleAssert.eventEmitted(tx, 'ForSale', (ev) => {
            return true;
        }, 'ForSale() event not emitted')
    })

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // add distributor to the distributor role
        await supplyChain.addDistributor(distributorID)

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        // process
        await supplyChain.processItem(upc, { from: originFarmerID })

        // pack
        await supplyChain.packItem(upc, { from: originFarmerID })

        // sale
        await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

        // buy
        const tx = await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('1', 'ether') })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], distributorID, 'Error: Distributor is not new owner')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Item not set to new distributor')
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')

        truffleAssert.eventEmitted(tx, 'Sold', (ev) => {
            return true;
        }, 'Sold() event not emitted')
    })

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        // process
        await supplyChain.processItem(upc, { from: originFarmerID })

        // pack
        await supplyChain.packItem(upc, { from: originFarmerID })

        // sale
        await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

        // buy
        await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('1', 'ether') })

        // ship
        const tx = await supplyChain.shipItem(upc, { from: distributorID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State')

        truffleAssert.eventEmitted(tx, 'Shipped', (ev) => {
            return true;
        }, 'Shipped() event not emitted')
    })

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()

        // add retailer to role
        await supplyChain.addRetailer(retailerID)

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        // process
        await supplyChain.processItem(upc, { from: originFarmerID })

        // pack
        await supplyChain.packItem(upc, { from: originFarmerID })

        // sale
        await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

        // buy
        await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('1', 'ether') })

        // ship
        await supplyChain.shipItem(upc, { from: distributorID })

        // receive
        const tx = await supplyChain.receiveItem(upc, { from: retailerID })

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], retailerID, 'Error: Retailer is not new owner')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Item not set to new retailer')
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State')

        truffleAssert.eventEmitted(tx, 'Received', (ev) => {
            return true;
        }, 'Received() event not emitted')
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // add consumer to role
        await supplyChain.addConsumer(consumerID)

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        // process
        await supplyChain.processItem(upc, { from: originFarmerID })

        // pack
        await supplyChain.packItem(upc, { from: originFarmerID })

        // sale
        await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

        // buy
        await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('1', 'ether') })

        // ship
        await supplyChain.shipItem(upc, { from: distributorID })

        // receive
        await supplyChain.receiveItem(upc, { from: retailerID })

        // purchase
        const tx = await supplyChain.purchaseItem(upc, { from: consumerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], consumerID, 'Error: Consumer is not new owner')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Item not set to new retailer')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')

        truffleAssert.eventEmitted(tx, 'Purchased', (ev) => {
            return true;
        }, 'Purchased() event not emitted')
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        const randomAcc = accounts[6]

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc, { from: randomAcc })
        
        // Verify the result set:
        // this should be enough to demo that random acc can access fetchItemBufferOne. Other tests cover rest
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Farmer is not the owner')
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // harvest
        await supplyChain.harvestItem(
            upc,
            originFarmerID,
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            { from: originFarmerID }
        )

        const randomAcc = accounts[7]

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc, { from: randomAcc })
        
        // Verify the result set:
        // this should be enough to demo that random acc can access fetchItemBufferTwo. Other tests cover rest
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
    })

});

