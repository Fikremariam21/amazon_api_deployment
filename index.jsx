const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

const app = express();

// Configure CORS for a specific origin is very important for production, but for now every origin
app.use(
  cors({ 
    origin:[ "http://localhost:5173", "https://fikremariam21.github.io"],
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
   })
  );

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Success!",
  });
});

// app.post("/payment/create", async(req, res) => {
//   const total = req.query.total;
//   if (total > 0){
//     console.log("payment received", total);
//     console.log("Type of total:", typeof total);
//   }
// })

app.post("/payment/create", async (req, res) => {
  const totalStr = req.query.total; // The value is always a string because query parameters in URLs are text.

  // console.log(totalStr); 

  try {
    const total = parseInt(totalStr, 10); // Parse to integer
    // console.log("Parsed value (number):", total);

    if (isNaN(total) || total <= 0) {
      return res
        .status(400)
        .json({ message: "Total must be a positive integer." });
    }

    const maxTotal = 10000000; // Set a reasonable maximum total (in cents, e.g., $100,000)
    if (total > maxTotal) {
      return res
        .status(400)
        .json({ message: "Total exceeds the maximum allowed value." });
    }
    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "USD",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    // after we get the client secret from strip, we will update the response in this way.
    res.status(201).json({
      clientSecret: paymentIntent.client_secret,  
    });
  } catch (error) {
    console.error("Error creating Payment Intent:", error);
    res
      .status(500)
      .json({
        message: "Error creating payment intent.",
        error: error.message,
      });
  }
});
const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
