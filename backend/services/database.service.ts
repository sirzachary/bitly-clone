import * as AWS from "aws-sdk";

export class Database {
  client = new AWS.DynamoDB.DocumentClient();

  async get(id: string) {
    const queryResult = await this.client
      .get({
        TableName: "bitly",
        Key: {
          id,
        },
        ProjectionExpression: "long_url, visits"
      })
      .promise();
    return queryResult.Item;
  }

  async put(id: string, url: string, visits: any[] = []) {
    const queryResult = await this.client
      .put({
        TableName: "bitly",
        Item: {
          id,
          long_url: url,
          visits: visits,
        }
      })
      .promise();
    return queryResult.Attributes;
  }
}
