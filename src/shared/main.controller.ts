import { Request, Response } from "express";
import { uuid } from "uuidv4";
import logger from "../util/logger";
import * as mongoStoreController from "../mongostore/mongostore.controller";

export const create = async (req: Request, res: Response) => {

 //   const self = this;
    const url: any = null;
    const correlationId = uuid();
    logger.info("Received create call", correlationId);

    // mongostore
    const dataObject: any = await mongoStoreController.save(req);

    // Promise.all([fooPromise, barPromise]).then(([foo, bar]) => {
    //   // compiler correctly warns if someField not found from foo's type
    //   console.log(foo.someField);
    // });

    res.status(201); // set http status code for response
    res.json({message: "Ok", url: url}); // send response body

};