import { APIGatewayProxyEvent } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { IUser } from "../utils";
import { NotFoundUserException } from "../exceptions";

const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();

export class AuthProvider {
  private readonly accessToken: string;

  constructor(event: APIGatewayProxyEvent) {
    const authHeader =
      event.headers.Authorization || event.headers.authorization;
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      throw new Error("AccessToken not found.");
    }

    this.accessToken = accessToken;
  }

  async validateUser(): Promise<IUser> {
    const params = {
      AccessToken: this.accessToken,
    };

    const userData = await cognitoIdentityServiceProvider
      .getUser(params)
      .promise();

    const sub = userData.UserAttributes.find((attr) => attr.Name === "sub");

    if (!sub) throw new NotFoundUserException("User not found");

    return { userId: sub.Value! };
  }

  getUserId(): string {
    const payloadBase64 = this.accessToken.split(".")[1];
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    const userId = payload.sub;

    if (!userId) throw new NotFoundUserException("User not found");

    return userId;
  }
}
