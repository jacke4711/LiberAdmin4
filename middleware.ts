import { matchesMiddleware } from "next/dist/shared/lib/router/router"
import { matchRoutes } from "react-router-dom"

// Without a defined matcher, this one line applies next-auth middleware to all routes / entire app
export {default} from "next-auth/middleware"

// Add matcher to apply next-auth middleware to specific routes
// Ref: https://nextjs.org/docs/building-your-application/middleware#matcher
// export const config = { matcher: ["/skaskyddas", "/skyddasidan"] }