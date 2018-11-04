/**
 * Created by gym on 18-07-27.
 * App entry
 */

import * as Koa from 'koa';
import * as koaBody from 'koa-better-body';
import {wechatRouter} from './handler/wechat';
import {WebError} from './lib/webError';


// 处理未在子模块中捕获的错误 避免程序崩溃
process.on('uncaughtException', e => {
    console.error(e);
});

const app = new Koa();

app.use(async (ctx, next) => {
    try {
        let start = Date.now();
        await next();
        if (ctx.status >= 400) {
            console.error('Status error');
            return
        }
        let end = Date.now();
        let tookTime = end - start;
        console.log(`Request success take time ${tookTime} ms`);
    } catch (e) {
        if (e instanceof WebError) {
            ctx.response.status = e.statusCode;
            ctx.response.body = e.message;
            console.warn(e.message);
        } else {
            ctx.response.status = 500;
            ctx.body = '网络错误,请稍后重试';
            console.error(e);
        }
    }
});

app.use(koaBody());

app.use(wechatRouter.routes()).use(wechatRouter.allowedMethods());

app.listen(7788);    //服务开始监听7788端口

console.log('app started at port 7788...');