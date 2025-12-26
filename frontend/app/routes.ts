import {
    type RouteConfig,
    index,
    route,
    layout,
} from "@react-router/dev/routes";

export default [
    layout("root.tsx", [
        index("routes/login.tsx"),
        route("dashboard", "routes/dashboard.tsx"),
        route("profile", "routes/profile.tsx"),
        route("logout", "routes/logout.tsx"),
    ]),
    route("*", "routes/error.tsx"),
] satisfies RouteConfig;
