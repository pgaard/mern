import { signout } from "./api-auth.js";

const auth = {
    // authenticaed if a jwt exists
    isAuthenticated() {
        if (typeof window == "undefined") return false;

        if (sessionStorage.getItem("jwt"))
            return JSON.parse(sessionStorage.getItem("jwt"));
        else return false;
    },
    // save jwt in session
    authenticate(jwt, cb) {
        if (typeof window !== "undefined")
            sessionStorage.setItem("jwt", JSON.stringify(jwt));
        cb();
    },
    clearJWT(cb) {
        if (typeof window !== "undefined") sessionStorage.removeItem("jwt");
        cb();
        //optional
        signout().then((data) => {
            document.cookie =
                "t=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });
    },
};

export default auth;
