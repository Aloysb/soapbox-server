import express, { Request, Response } from "express";
import { body, oneOf, validationResult, check } from "express-validator";

const app = express();
app.use(express.json());

enum FormFields {
  name = "name",
  email = "email",
  contactMethod = "contact_method",
  phone = "phone",
  message = "message",
}

enum ContactMethod {
  phone = "phone",
  email = "email",
}

app.get("/ping", (request: Request, response: Response) => {
  response.json({ message: `pong` });
});

app.post(
  "/contact",
  body(FormFields.name)
    .isAlpha("fr-FR", { ignore: " -" })
    .withMessage(
      "Letters only. Accept - and space, as well as french and english characters."
    )
    .notEmpty(),
  oneOf([
    check(FormFields.email)
      .isEmail()
      .withMessage("Email only: name@provide.domain"),
    check(FormFields.phone)
      .isNumeric()
      .withMessage("Numbers and symbols (+) only. Remove whitespaces and dash"),
  ]),
  body(FormFields.message)
    .isAscii()
    .optional()
    .withMessage("Alphanumeric characters only."),
  (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    response.json({ message: `All good` });
  }
);

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
