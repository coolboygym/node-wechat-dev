/**
 *  Created by gym on 18-9-14.
 *  Wechat service manager
 */


// 微信公众号相关服务
export class WechatService {

    // 处理微信请求 获取回复的内容
    static async reply(message): Promise<string> {
        let replyMessage = '';
        if (message.MsgType === 'text') {
            replyMessage = message.Content  //原样返回用户发送的内容
        }

        return replyMessage;
    }


    // 处理原始xml对象 处理后的对象可以通过key直接访问value
    static formatMessage(result) {
        let message = {};
        if (typeof result === 'object') {
            let keys = Object.keys(result);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let item = result[key];
                if (!(item instanceof Array) || item.length === 0) continue;
                if (item.length === 1) {
                    let val = item[0];
                    if (typeof val === 'object') message[key] = WechatService.formatMessage(val);
                    else message[key] = (val || '').trim();
                } else {
                    message[key] = [];
                    for (let j = 0, k = item.length; j < k; j++) message[key].push(WechatService.formatMessage(item[j]));
                }
            }
        }
        return message;
    }


    // 将微信发送到服务器的内容与回复的内容组合得到用于回复的xml文件
    static formatWechatReply(content, message) {
        let type = 'text';
        if (Array.isArray(content)) type = 'news';
        type = content.type || type;

        return `
	        <xml>
		        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
		        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
		        <CreateTime>${Date.now()}</CreateTime>
		        <MsgType><![CDATA[${type}]]></MsgType>
		        <Content><![CDATA[${content}]]></Content>
	        </xml> `;
    }
}