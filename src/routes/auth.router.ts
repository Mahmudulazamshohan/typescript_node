import { Router, Response, Request } from "express";
import { AuthMiddleware } from "./../middlewares/auth.middleware";
import JsonWebToken from "jsonwebtoken";
const router = Router();
router.get("/login", (req: Request, res: Response) => {
  const { email, password } = req.query;
  console.log(email);
  var token = JsonWebToken.sign(
    {
      email,
      password,
    },
    "somesecret",
    {
      expiresIn: "1m",
    }
  );
  res.json({ token });
});
router.get("/verify", AuthMiddleware, (req: Request, res: Response) => {
  var { token } = req.query;

  var data = JsonWebToken.verify(String(token).toString(), "somesecret");
  res.json({
    data,
  });
});
export const AuthRouter = router;
