import Product from "../models/Product.js";
import Order from "../models/Order.js";
import stripe from "stripe"
import User from "../models/User.js"



// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.id;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" }); // ✅ Typo fixed: "Invaild" → "Invalid"
        }

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0);

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

        return res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};



// Place Order Stripe : /api/order/stripe

import Stripe from "stripe";
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const placeOrderStripe = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.id;
        const { origin } = req.headers;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let productData = [];
        let amount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.json({ success: false, message: "Product not found" });
            }
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            amount += product.offerPrice * item.quantity;
        }

        amount += Math.floor(amount * 0.02); // Add 2% tax

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "ONLINE",
        });

        const line_items = productData.map(item => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.floor(item.price * 100), // cents, no tax here
            },
            quantity: item.quantity,
        }));

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        });

        return res.json({ success: true, url: session.url });

    } catch (error) {
        console.error("Stripe Error:", error);
        return res.json({ success: false, message: error.message });
    }
};



// Stripe Webhooks to PAyments Action : /stripe

export const stripeWebhooks = async (request, response) => {
    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

    } catch (error) {
        response.status(400).send(`Webhook Error : ${error.message}`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            // Mark Payment as Paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true });
            // Clear user cart
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            break;

        }


        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }

        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }

    response.json({received:true})
}



// Get User Orders
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.id;

        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        })
            .populate("items.product")
            .populate("address") // ✅ FIX 2: This now works because Address is imported above
            .sort({ createdAt: -1 }); // ✅ FIX 3: Typo "createsAt" → "createdAt"

        console.log("Querying for user:", userId);
        console.log("Orders found:", orders.length);

        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



// Get All Orders (for seller / admin)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        })
            .populate("items.product")
            .populate("address") // ✅ FIX 4: Ensure populate is split correctly for clarity
            .sort({ createdAt: -1 }); // ✅ FIX 5: Typo "createsAt" → "createdAt"

        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
