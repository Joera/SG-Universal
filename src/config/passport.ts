import passport from "passport";
import passportLocal from "passport-local";
import { Request, Response, NextFunction } from "express";

const LocalStrategy = passportLocal.Strategy;




/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    return done(undefined, {});
}));


export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
};

export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {

   // const provider = req.path.split("/").slice(-1)[0];
    return next();
};
