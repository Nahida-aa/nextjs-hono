// import { NextRequest } from "next/server";


// /**
//  *@swagger
//  * /api/auth/aa/signin: 
//  *  post:
//  *    tags: [auth]
//  *    summary: 读取用户自己的详细, 需要在登录状态
//  *    requestBody: 
//  *      content:
//  *        application/json: 
//  *          schema:
//  *            type: object
//  *            properties:
//  *              csrf_token:
//  *                type: string
//  *              name:
//  *                type: string
//  *                minLength: 1
//  *              password:
//  *                type: string
//  *                minLength: 6
//  *            required:
//  *              - csrf_token
//  *              - name
//  *              - password
//  *    responses:
//  *      200:
//  *        description: 登录成功，响应头中会自动设置 sessionToken 到 Cookie 中
//  *        content:
//  *          application/json:
//  *            schema:
//  *              type: object
//  *              properties:
//  *                sessionToken:
//  *                  type: string
//  *                tokenType:
//  *                  type: string
//  *                  example: Bearer
//  *              required: [sessionToken, tokenType]
//  *      404:
//  *        content:
//  *          application/json:     
//  *            schema:
//  *              type: object
//  *              properties:
//  *                message:
//  *                  type: string
//  *                  example: 用户未找到
//  *              required: [message]
//  *      401:
//  *        content:
//  *          application/json:
//  *            schema:
//  *              type: object
//  *              properties:
//  *                message:
//  *                  type: string
//  *                  example: 用户名或密码错误
//  *              required: [message]
//  *      422:
//  *        content:
//  *          application/json:
//  *            schema:
//  *              type: object
//  *              properties:
//  *                success:
//  *                  type: boolean
//  *                err:
//  *                  type: object
//  *                  properties:
//  *                    issues:
//  *                      type: array
//  *                      items:
//  *                        type: object
//  *                      properties:
//  *                        code: 
//  *                          type: string
//  *                    name:
//  *                      type: string
//  *                      example: ValidationError
//  *                  required: [issues, name]
//  *             required: [success, err]
//  */
// export async function POST(req: NextRequest) {
//   return { status: 200, body: { message: 'Hello, World!' } };
// }