import Koa from "koa";
import serve from "koa-static";

const app = new Koa();

app.use(async (ctx, next) => {
	await next();

	//Required for SharedArrayBuffer
	ctx.set("Cross-Origin-Opener-Policy", "same-origin");
	ctx.set("Cross-Origin-Embedder-Policy", "require-corp");
});

app.use(serve("public"));

app.listen();