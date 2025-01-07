import Config from "./config";
import { jwtVerify } from "jose";

interface BooleanMessage {
    message: string,
    result: boolean
}

const secretKey = new TextEncoder().encode(Config.next.secretKey);

/** decode the token in the localStorage to get email and check if the one equals to the given email */
const isCurrentUser = async (emailOfItem: string) => {
    const rtnValue = {
        result: false,
        message: ""
    } as BooleanMessage;

    const token = localStorage.getItem("token");
    if (!token) {
        return rtnValue; // explicit return is needed to let ts know the token is not null
    }

    await jwtVerify(token, secretKey)
        .then(decoded => {
            const emailOfToken = decoded.payload? decoded.payload.email : "";
            if (!emailOfToken) {
                console.log(`email in the token is invalid: ${emailOfToken}`);
                rtnValue.message = "failed to confirm the email.";
                return;
            }
            if (emailOfToken !== emailOfItem) {
                console.log(`email in the token doesn't match the item: ${emailOfToken}`);
                rtnValue.message = "the email doesn't match with the item's one.";
                return;
            }
            rtnValue.result = true;
        })
        .catch((err) => {
            console.log(err);
        });
    return rtnValue;
};

export { isCurrentUser };
export type { BooleanMessage };