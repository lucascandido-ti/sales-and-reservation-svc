import { APIGatewayProxyEvent } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";

import axios, { AxiosInstance } from "axios";

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

  async validateUser(): Promise<{ userId: string }> {
    try {
      const params = {
        AccessToken: this.accessToken,
      };

      const userData = await cognitoIdentityServiceProvider
        .getUser(params)
        .promise();

      console.debug(
        "[AuthProvider][validateUser]|[UserAttributes]",
        JSON.stringify(userData.UserAttributes)
      );

      const sub = userData.UserAttributes.find((attr) => attr.Name === "sub");

      if (!sub) throw new NotFoundUserException("User not found");

      return { userId: sub.Value! };
    } catch (error: any) {
      throw new NotFoundUserException("User not authorized");
    }
  }

  getUserId(): string {
    const payloadBase64 = this.accessToken.split(".")[1];
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    const userId = payload.sub;

    if (!userId) throw new NotFoundUserException("User not found");

    return userId;
  }

  async getUserData(): Promise<IUser> {
    const userData = await cognitoIdentityServiceProvider
      .getUser({ AccessToken: this.accessToken })
      .promise();

    console.debug(
      "[AuthProvider][validateUser]|[UserAttributes]",
      JSON.stringify(userData.UserAttributes)
    );

    return {
      id: userData.UserAttributes.find((attr) => attr.Name === "sub")?.Value,
      email: userData.UserAttributes.find((attr) => attr.Name === "email")
        ?.Value,
      phone_number: userData.UserAttributes.find(
        (attr) => attr.Name === "phone_number"
      )?.Value,
      name: userData.UserAttributes.find((attr) => attr.Name === "name")?.Value,
      address: userData.UserAttributes.find((attr) => attr.Name === "address")
        ?.Value,
      cnh: userData.UserAttributes.find((attr) => attr.Name === "custom:cnh")
        ?.Value,
      rg: userData.UserAttributes.find((attr) => attr.Name === "custom:rg")
        ?.Value,
    };
  }
}
