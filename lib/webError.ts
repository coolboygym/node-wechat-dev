/**
 *  Created by gym on 18-07-27.
 */


// 自定义的错误类 保存了错误信息和错误状态码
export class WebError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}