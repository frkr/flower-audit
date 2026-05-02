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
		route("calendar", "routes/calendar/calendar.ts"),
		route("search", "routes/go/search.ts"),
		route("chat", "routes/chat/chat.ts"),
		route("files", "routes/files/files.ts"),
		route("index", "routes/go/api.ts"),
	]),
] satisfies RouteConfig;
