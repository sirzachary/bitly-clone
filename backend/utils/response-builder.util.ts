import { APIGatewayProxyResult } from "aws-lambda";

export class ResponseBuilder {
  static Success(body: any): APIGatewayProxyResult {
    return {
      statusCode: 200,
      body: JSON.stringify(body, null, 2),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      }
    };
  }

  static Failure(body: any): APIGatewayProxyResult {
    return {
      statusCode: 500,
      body: JSON.stringify(body, null, 2),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      }
    };
  }

  static Redirect(url: string): APIGatewayProxyResult {
    return {
      statusCode: 301,
      body: null,
      headers: {
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Credentials": true,
        Location: url
      }
    };
  }
}
