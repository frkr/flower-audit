import { type RouteConfig, route, index, layout, prefix } from "@react-router/dev/routes";

export default [
	layout("layouts/app.tsx", [
		index("routes/landing/welcome.tsx"),
		route("go", "routes/go/go.tsx"),
		route("flow", "routes/flow/flow.tsx"),
		route("flow/:id", "routes/flow/flow.id.tsx"),
		route("process", "routes/process/process.tsx"),
		route("process/:id", "routes/process/process.id.tsx"),
		route("setup", "routes/setup/setup.tsx"),
	]),
	route("landing", "routes/landing/landing.tsx"),
	route("login", "routes/login/login.ts"),
	route("login/callback", "routes/login/login.callback.ts"),
	route("logout", "routes/login/logout.ts"),
	...prefix("api", [
		route("calendar", "api/calendar.ts"),
		route("search", "api/search.ts"),
		route("chat", "api/chat.ts"),
		route("files", "api/files.ts"),
		route("index", "api/index.ts"),
	]),
] satisfies RouteConfig;
