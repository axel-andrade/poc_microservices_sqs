import express from "express";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import env from "../../config/env";

// Configure the region
AWS.config.update({ region: "us-east-1" });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const queueUrl = env.sendEmailQueueUrl;

const port = env.ordersApiPort;
const app = express();

app.use(bodyParser.json());

app.get("/", (_, res) => {
  res.send("Welcome to NodeShop Orders.");
});

app.post("/order", (req, res) => {
  const orderData = {
    userEmail: req.body["userEmail"],
    itemName: req.body["itemName"],
    itemPrice: req.body["itemPrice"],
    itemsQuantity: req.body["itemsQuantity"],
  };

  const sqsOrderData = {
    MessageAttributes: {
      userEmail: {
        DataType: "String",
        StringValue: orderData.userEmail,
      },
      itemName: {
        DataType: "String",
        StringValue: orderData.itemName,
      },
      itemPrice: {
        DataType: "Number",
        StringValue: orderData.itemPrice,
      },
      itemsQuantity: {
        DataType: "Number",
        StringValue: orderData.itemsQuantity,
      },
    },
    MessageBody: JSON.stringify(orderData),
    MessageDeduplicationId: req.body["userEmail"],
    MessageGroupId: "UserOrders",
    QueueUrl: queueUrl,
  };

  // send the order data to the SQS queue
  const sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

  sendSqsMessage
    .then((data) => {
      console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);
      res.send("Thank you for your order. Check you inbox for the confirmation email.");
    })
    .catch((err) => {
      console.log(`OrdersSvc | ERROR: ${err}`);
      // send email to emails API
      res.send("We ran into an error. Please try again.");
    });
});

console.log(`Orders service listening on port ${port}`);
app.listen(port);
