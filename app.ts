import express, { Request, Response } from "express";
import { body, oneOf, validationResult, check } from "express-validator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { emailBody } from "./emailBody";
var cors = require("cors");

// Import environment variables
dotenv.config();

// console.log(process.env.GMAIL_USERNAME);
const app = express();
app.use(express.json());
app.use(cors());
// disable cors
app.options("*", cors());

enum FormFields {
  name = "name",
  contact = "contact",
  contactMethod = "contact_method",
  message = "message",
}

// Heartbeat
app.get("/ping", (request: Request, response: Response) => {
  response.json({ message: `pong` });
});

// POST @ /contact
// send email
app.post(
  "/contact",
  //== start of validation
  //== Name
  body(FormFields.name)
    .isAlpha("fr-FR", { ignore: " -" })
    .withMessage(
      "Letters only. Accept - and space, as well as french and english characters."
    )
    .notEmpty(),
  // == Email or phone number
  oneOf([
    check(FormFields.contact)
      .isEmail()
      .withMessage("Email only: name@provide.domain"),
    check(FormFields.contact)
      .isNumeric()
      .withMessage("Numbers and symbols (+) only. Remove whitespaces and dash"),
  ]),
  // == Message (optional)
  body(FormFields.message)
    .isAscii()
    .optional()
    .withMessage("Alphanumeric characters only."),

  (request: Request, response: Response) => {
    const errors = validationResult(request);

    // If unvalid, bad request
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    console.log(request.body);
    response.json({ message: `All good` });

    sendEmail(request.body).catch((e) => {
      console.log(e);
    });
  }
);

const sendEmail = async ({
  message,
  name,
  contact_method,
  contact,
}: {
  message: string;
  name: string;
  contact_method: string;
  contact: string;
}) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: '"Soapbox Wesbite 🧼" <soapbox.website.contact@gmail.com>', // sender address
    to: "aloysberger@gmail.com", // list of receivers
    subject: "Someone's contacting you on your website!", // Subject line
    text: "Hi Christian 👋,", // plain text body
    html: emailBody(message),
  });
};

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
