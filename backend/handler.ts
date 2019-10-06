import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import * as shortid from "shortid";
import { Database } from "./services/database.service";
import { ResponseBuilder } from "./utils/response-builder.util";

const apiPath = 'https://r.onsensei.com';
const webPath = 'https://bitly.onsensei.com';
const db = new Database();

interface CreateLink {
  long: string;
  custom: string;
}

interface Link {
  id: string;
  long: string;
  short: string;
  visits: Visit[];
}

interface Visit {
  ip: string;
  visitedOn: string;
}

export const shorten: APIGatewayProxyHandler = async (event, _context) => {
  try {
    console.log(event);
    const payload: CreateLink = JSON.parse(event.body);
  
    let existingItem = null;
    if (payload.custom) {
      existingItem = await db.get(payload.custom);
    }
  
    if (existingItem) {
      return ResponseBuilder.Failure({ message: "Custom ID already exists" });
    }
  
    const id = payload.custom || shortid.generate();
  
    await db.put(id, payload.long);

    const response: Link = {
      id,
      long: payload.long,
      short: generateShortLink(id),
      visits: [],
    }
  
    return ResponseBuilder.Success(response);
  } catch (error) {
    return ResponseBuilder.Failure(error);
  }
};

export const stats: APIGatewayProxyHandler = async (event, _context) => {
  // console.log(event);
  const id: string = event.pathParameters.id;
  console.log(id);
  const existingItem = await db.get(id) as Link;

  return ResponseBuilder.Success(existingItem);
};

export const redirect: APIGatewayProxyHandler = async (event, _context) => {
  // console.log(event);
  const id: string = event.pathParameters.id;
  const existingItem = await db.get(id);

  if (!existingItem) {
    return ResponseBuilder.Redirect(webPath);
  }
  const requesterIP = event.requestContext.identity.sourceIp;
  const currentVisit: Visit = {
    visitedOn: new Date().toISOString(),
    ip: requesterIP,
  }
  console.log(existingItem);
  const newVisits = [...existingItem.visits, currentVisit];
  console.log(newVisits);
  await db.put(id, existingItem.long_url, newVisits);
  return ResponseBuilder.Redirect(existingItem.long_url);
};

function generateShortLink(id: string): string {
  return apiPath + `/to/${id}`
}
