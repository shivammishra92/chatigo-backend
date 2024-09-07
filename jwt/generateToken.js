import jwt from "jsonwebtoken";

//the user which has the token will only be able to chat else not
const createTokenAndSaveCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
    expiresIn: "10d",
  });
  res.cookie("jwt", token, { // name of cookie - jwt
    httpOnly: true, // xss
    secure: true,//Ensures the cookie is sent only over HTTPS connections.
    sameSite: "strict", //  mitigating cross-site request forgery (CSRF) attacks.
  });
};
export default createTokenAndSaveCookie;
