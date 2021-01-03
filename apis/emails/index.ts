import AWS from "aws-sdk";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { Consumer, SQSMessage } from "sqs-consumer";
import env from "../../config/env";

// configure Nodemailer
let transport: Mail;

nodemailer.createTestAccount((err, account) => {
  // create reusable transporter object using the default SMTP transport
  transport = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass, // generated ethereal password
    },
  });
});

const sendMail = async (message: string): Promise<void> => {
  try {
    const sqsMessage = JSON.parse(message);
    const emailMessage = {
      from: "test@gmail.com", // Sender address
      to: sqsMessage.userEmail, // Recipient address
      subject: "Order Received | NodeShop", // Subject line
      html: `<p>Hi ${sqsMessage.userEmail}.</p. <p>Your order of ${sqsMessage.itemsQuantity} ${sqsMessage.itemName} has been received and is being processed.</p> <p> Thank you for shopping with us! </p>`, // Plain text body
    };

    await transport.sendMail(emailMessage);
    console.info("Email successfully sent ...");
  } catch (error) {
    console.error(error);
  }
};

// Configure the region
AWS.config.update({ region: "us-east-1" });

const queueUrl = env.sendEmailQueueUrl;

const app = Consumer.create({
  queueUrl: queueUrl,
  handleMessage: async (message: SQSMessage): Promise<void> => {
    console.info("Message received: ", message.MessageId);
    await sendMail(message.Body);
  },
  sqs: new AWS.SQS(),
  batchSize: 10,
});

app.on("error", (err) => {
  console.error(err.message);
});

app.on("processing_error", (err) => {
  console.error(err.message);
});

console.log("Emails service is running");
app.start();
