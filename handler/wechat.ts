/*
 *  Created by gym on 18-11-01.
 *  Wechat router entry
 */

import * as Router from "koa-router";
import * as xml2js from 'xml2js';
import {createHash} from "crypto";
import {WebError} from '../lib/webError';
import {WechatService} from '../service/wechat';
import {Config} from '../config/config'


export const wechatRouter = new Router();

// sha1加密函数
function sha1(content) {
    let hash = createHash('sha1');
    hash.update(content);
    return hash.digest().toString('hex')
}


// 将传入的XML Body转换为JS Object
function parseXML(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, (err, res) => {
            if (err) {
                reject(err);
                return
            } else {
                resolve(res)
            }
        })
    })
}

// 处理 xml body 的中间件
wechatRouter.use(async (ctx, next) => {
    if (ctx.req.headers['content-type'] == 'text/xml') {
        ctx.request['body'] = await parseXML(ctx.request['body']);
    }
    await next();
});

// 定义路由规格
wechatRouter.get('/', wechat);
wechatRouter.post('/', wechat);

// 处理所有微信相关请求的中间件函数
async function wechat(ctx) {
    if (ctx.request.method !== 'GET' && ctx.request.method !== 'POST') {
        throw new WebError('请求方式不允许', 400);
    }
    let token = Config.token;
    let signature = ctx.request.query.signature;
    let nonce = ctx.request.query.nonce;
    let timestamp = ctx.request.query.timestamp;
    let echostr = ctx.request.query.echostr;
    let str = [token, timestamp, nonce].sort().join('');
    let sha = sha1(str);

    if (ctx.request.method === 'GET') {
        ctx.body = (sha === signature) ? echostr + '' : 'failed';
        return;
    }

    if (sha !== signature) {
        throw new WebError('无效的签名', 400);
    }

    // 处理原始的微信请求体 转化成Key-Value的形式 便于处理
    let message = WechatService.formatMessage(ctx.request.body.xml);

    // 获取后台回复的内容
    let replyMessage = await WechatService.reply(message);

    // 将内容封装成微信要求的XML格式
    let xmlBody = WechatService.formatWechatReply(replyMessage, message);

    ctx.status = 200;
    ctx.type = 'application/xml';
    ctx.body = xmlBody;

}