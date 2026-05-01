import { type RouteConfig, route, index, layout, prefix } from "@react-router/dev/routes";

export default [
	layout("layouts/app.tsx", [
		index("routes/welcome.tsx"),
		route("start", "routes/start.tsx"),
		route("flow", "routes/flow.tsx"),
		route("flow/:id", "routes/flow.id.tsx"),
		route("process", "routes/process.tsx"),
		route("process/:id", "routes/process.id.tsx"),
		route("setup", "routes/setup.tsx"),
	]),
	route("landing", "routes/landing.tsx"),
	route("login", "routes/login.ts"),
	route("login/callback", "routes/login.callback.ts"),
	route("logout", "routes/logout.ts"),
	...prefix("api", [
		route("calendar", "api/calendar.ts"),
		route("search", "api/search.ts"),
		route("chat", "api/chat.ts"),
		route("files", "api/files.ts"),
		route("index", "api/index.ts"),
	]),
] satisfies RouteConfig;
