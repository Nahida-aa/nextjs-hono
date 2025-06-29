// Generated file. Do not edit
// Codes retrieved on Thu, 03 Oct 2024 12:05:14 GMT from https://raw.githubusercontent.com/prettymuchbryce/http-status-codes/refs/heads/master/codes.json

import { ClientErrorStatusCode as _ClientErrorStatusCode, InfoStatusCode, SuccessStatusCode, ServerErrorStatusCode } from "hono/utils/http-status";

export type ClientErrorStatusCode = _ClientErrorStatusCode | 419 | 420

/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.3.3
 *
 * The request has been received but not yet acted upon. It is non-committal, meaning that there is no way in HTTP to later send an asynchronous response indicating the outcome of processing the request. It is intended for cases where another process or server handles the request, or for batch processing.
 */
export const ACCEPTED: SuccessStatusCode = 202;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.3
 *
 * This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
 */
export const BAD_GATEWAY = 502;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.1
 *
 * This response means that server could not understand the request due to invalid syntax.
 */
export const BAD_REQUEST: ClientErrorStatusCode = 400;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.8
 *
 * This response is sent when a request conflicts with the current state of the server.
 * 翻译: 当请求与服务器的当前状态冲突时，将发送此响应。
 */
export const CONFLICT: ClientErrorStatusCode = 409;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.2.1
 *
 * This interim response indicates that everything so far is OK and that the client should continue with the request or ignore it if it is already finished.
 */
export const CONTINUE: InfoStatusCode = 100;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.3.2
 *
 * The request has succeeded and a new resource has been created as a result of it. This is typically the response sent after a PUT request.
 */
export const CREATED: SuccessStatusCode = 201;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.14
 *
 * This response code means the expectation indicated by the Expect request header field can't be met by the server.
 * 翻译: 此响应代码表示服务器无法满足Expect请求头字段指示的期望。
 */
export const EXPECTATION_FAILED: ClientErrorStatusCode = 417;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc2518#section-10.5
 *
 * The request failed due to failure of a previous request.
 * 翻译: 由于先前请求的失败，请求失败。
 */
export const FAILED_DEPENDENCY: ClientErrorStatusCode = 424;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.3
 *
 * The client does not have access rights to the content, i.e. they are unauthorized, so server is rejecting to give proper response. Unlike 401, the client's identity is known to the server.
 * 翻译: 客户端没有访问内容的权限，即未经授权，因此服务器拒绝提供适当的响应。 与401不同，服务器知道客户端的身份。
 */
export const FORBIDDEN: ClientErrorStatusCode = 403;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.5
 *
 * This error response is given when the server is acting as a gateway and cannot get a response in time.
 */
export const GATEWAY_TIMEOUT = 504;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.9
 *
 * This response would be sent when the requested content has been permenantly deleted from server, with no forwarding address. Clients are expected to remove their caches and links to the resource. The HTTP specification intends this status code to be used for "limited-time, promotional services". APIs should not feel compelled to indicate resources that have been deleted with this status code.
 */
export const GONE: ClientErrorStatusCode = 410;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.6
 *
 * The HTTP version used in the request is not supported by the server.
 */
export const HTTP_VERSION_NOT_SUPPORTED = 505;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc2324#section-2.3.2
 *
 * Any attempt to brew coffee with a teapot should result in the error code "418 I'm a teapot". The resulting entity body MAY be short and stout.
 * 翻译: 使用茶壶煮咖啡的任何尝试都应该导致错误代码“418我是一个茶壶”。 生成的实体主体可能是短而结实的。
 */
export const IM_A_TEAPOT: ClientErrorStatusCode = 418;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc2518#section-10.6
 *
 * The 507 (Insufficient Storage) status code means the method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request. This condition is considered to be temporary. If the request which received this status code was the result of a user action, the request MUST NOT be repeated until it is requested by a separate user action.
 * 翻译: 507（存储空间不足）状态代码表示无法在资源上执行方法，因为服务器无法存储成功完成请求所需的表示。 此条件被认为是临时的。 如果接收到此状态代码的请求是用户操作的结果，则在通过单独的用户操作请求之前，不得重复该请求。
 */
export const INSUFFICIENT_SPACE_ON_RESOURCE: ClientErrorStatusCode = 419;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc2518#section-10.6
 *
 * The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.
 */
export const INSUFFICIENT_STORAGE = 507;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.1
 *
 * The server encountered an unexpected condition that prevented it from fulfilling the request.
 */
export const INTERNAL_SERVER_ERROR: ServerErrorStatusCode = 500;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.10
 *
 * The server rejected the request because the Content-Length header field is not defined and the server requires it.
 * 翻译: 服务器拒绝请求，因为未定义Content-Length标头字段，而服务器需要它。
 */
export const LENGTH_REQUIRED: ClientErrorStatusCode = 411;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc2518#section-10.4
 *
 * The resource that is being accessed is locked.
 * 翻译: 正在访问的资源已锁定。
 */
export const LOCKED: ClientErrorStatusCode = 423;
/**
 * @deprecated
 * Official Documentation @ https://tools.ietf.org/rfcdiff?difftype=--hwdiff&url2=draft-ietf-webdav-protocol-06.txt
 *
 * A deprecated response used by the Spring Framework when a method has failed.
 * 翻译: Spring框架在方法失败时使用的已弃用响应。
 */
export const METHOD_FAILURE: ClientErrorStatusCode = 420;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.5
 *
 * The request method is known by the server but has been disabled and cannot be used. For example, an API may forbid DELETE-ing a resource. The two mandatory methods, GET and HEAD, must never be disabled and should not return this error code.
 * 翻译: 服务器知道请求方法，但已禁用并且无法使用。 例如，API可能禁止删除资源。 两种强制方法GET和HEAD绝不能被禁用，也不应返回此错误代码。
 */
export const METHOD_NOT_ALLOWED: ClientErrorStatusCode = 405;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.4.2
 *
 * This response code means that URI of requested resource has been changed. Probably, new URI would be given in the response.
 */
export const MOVED_PERMANENTLY = 301;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.4.3
 *
 * This response code means that URI of requested resource has been changed temporarily. New changes in the URI might be made in the future. Therefore, this same URI should be used by the client in future requests.
 */
export const MOVED_TEMPORARILY = 302;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc2518#section-10.2
 *
 * A Multi-Status response conveys information about multiple resources in situations where multiple status codes might be appropriate.
 */
export const MULTI_STATUS: SuccessStatusCode = 207;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.4.1
 *
 * The request has more than one possible responses. User-agent or user should choose one of them. There is no standardized way to choose one of the responses.
 */
export const MULTIPLE_CHOICES = 300;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc6585#section-6
 *
 * The 511 status code indicates that the client needs to authenticate to gain network access.
 */
export const NETWORK_AUTHENTICATION_REQUIRED = 511;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.3.5
 *
 * There is no content to send for this request, but the headers may be useful. The user-agent may update its cached headers for this resource with the new ones.
 */
export const NO_CONTENT: SuccessStatusCode = 204;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.3.4
 *
 * This response code means returned meta-information set is not exact set as available from the origin server, but collected from a local or a third party copy. Except this condition, 200 OK response should be preferred instead of this response.
 */
export const NON_AUTHORITATIVE_INFORMATION: SuccessStatusCode = 203;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.6
 *
 * This response is sent when the web server, after performing server-driven content negotiation, doesn't find any content following the criteria given by the user agent.
 * 翻译: 当Web服务器在执行服务器驱动的内容协商后，未找到用户代理给出的标准的任何内容时，将发送此响应。
 */
export const NOT_ACCEPTABLE: ClientErrorStatusCode = 406;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.4
 *
 * The server can not find requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 to hide the existence of a resource from an unauthorized client. This response code is probably the most famous one due to its frequent occurence on the web.
 */
export const NOT_FOUND: ClientErrorStatusCode = 404;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.2
 *
 * The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.
 */
export const NOT_IMPLEMENTED = 501;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7232#section-4.1
 *
 * This is used for caching purposes. It is telling to client that response has not been modified. So, client can continue to use same cached version of response.
 */
export const NOT_MODIFIED = 304;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.3.1
 *
 * The request has succeeded. The meaning of a success varies depending on the HTTP method:
 * GET: The resource has been fetched and is transmitted in the message body.
 * HEAD: The entity headers are in the message body.
 * POST: The resource describing the result of the action is transmitted in the message body.
 * TRACE: The message body contains the request message as received by the server
 */
export const OK: SuccessStatusCode = 200;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7233#section-4.1
 *
 * This response code is used because of range header sent by the client to separate download into multiple streams.
 */
export const PARTIAL_CONTENT: SuccessStatusCode = 206;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.2
 *
 * This response code is reserved for future use. Initial aim for creating this code was using it for digital payment systems however this is not used currently.
 * - 翻译: 此响应代码保留供将来使用。 创建此代码的初始目的是将其用于数字支付系统，但目前尚未使用。
 */
export const PAYMENT_REQUIRED: ClientErrorStatusCode = 402;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7538#section-3
 *
 * This means that the resource is now permanently located at another URI, specified by the Location: HTTP Response header. This has the same semantics as the 301 Moved Permanently HTTP response code, with the exception that the user agent must not change the HTTP method used: if a POST was used in the first request, a POST must be used in the second request.
 */
export const PERMANENT_REDIRECT = 308;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7232#section-4.2
 *
 * The client has indicated preconditions in its headers which the server does not meet.
 * - 翻译: 客户端在其标头中指示了服务器未满足的先决条件。
 */
export const PRECONDITION_FAILED: ClientErrorStatusCode = 412;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc6585#section-3
 *
 * The origin server requires the request to be conditional. Intended to prevent the 'lost update' problem, where a client GETs a resource's state, modifies it, and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
 * - 翻译: 源服务器要求请求是有条件的。 旨在防止“丢失更新”问题，其中客户端获取资源的状态，对其进行修改，然后将其放回服务器，与此同时第三方已经修改了服务器上的状态，导致冲突。
 */
export const PRECONDITION_REQUIRED: ClientErrorStatusCode = 428;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc2518#section-10.1
 *
 * This code indicates that the server has received and is processing the request, but no response is available yet.
 */
export const PROCESSING: InfoStatusCode = 102;
/**
 * Official Documentation @ https://www.rfc-editor.org/rfc/rfc8297#page-3
 *
 * This code indicates to the client that the server is likely to send a final response with the header fields included in the informational response.
 */
export const EARLY_HINTS: InfoStatusCode = 103;
/**
 * Official Documentation @ https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.15
 *
 * The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.
 * - 翻译: 服务器拒绝使用当前协议执行请求，但在客户端升级到不同协议后可能愿意这样做。
 */
export const UPGRADE_REQUIRED: ClientErrorStatusCode = 426;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7235#section-3.2
 *
 * This is similar to 401 but authentication is needed to be done by a proxy.
 * - 翻译: 这类似于401，但需要代理进行身份验证。
 */
export const PROXY_AUTHENTICATION_REQUIRED: ClientErrorStatusCode = 407;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc6585#section-5
 *
 * The server is unwilling to process the request because its header fields are too large. The request MAY be resubmitted after reducing the size of the request header fields.
 * - 翻译: 服务器不愿意处理请求，因为其标头字段太大。 在减小请求标头字段的大小后，可以重新提交请求。
 */
export const REQUEST_HEADER_FIELDS_TOO_LARGE: ClientErrorStatusCode = 431;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.7
 *
 * This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. This response is used much more since some browsers, like Chrome, Firefox 27+, or IE9, use HTTP pre-connection mechanisms to speed up surfing. Also note that some servers merely shut down the connection without sending this message.
 * - 翻译: 一些服务器在空闲连接上发送此响应，即使客户端没有任何先前的请求。 这意味着服务器希望关闭此未使用的连接。 自从一些浏览器（如Chrome，Firefox 27+或IE9）使用HTTP预连接机制加快浏览速度以来，此响应的使用要多得多。 还要注意，一些服务器仅关闭连接而不发送此消息。
 */
export const REQUEST_TIMEOUT: ClientErrorStatusCode = 408;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.11
 *
 * Request entity is larger than limits defined by server; the server might close the connection or return an Retry-After header field.
 */
export const REQUEST_TOO_LONG: ClientErrorStatusCode = 413;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.12
 *
 * The URI requested by the client is longer than the server is willing to interpret.
 */
export const REQUEST_URI_TOO_LONG: ClientErrorStatusCode = 414;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7233#section-4.4
 *
 * The range specified by the Range header field in the request can't be fulfilled; it's possible that the range is outside the size of the target URI's data.
 */
export const REQUESTED_RANGE_NOT_SATISFIABLE: ClientErrorStatusCode = 416;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.3.6
 *
 * This response code is sent after accomplishing request to tell user agent reset document view which sent this request.
 */
export const RESET_CONTENT: SuccessStatusCode = 205;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.4.4
 *
 * Server sent this response to directing client to get requested resource to another URI with an GET request.
 */
export const SEE_OTHER = 303;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.4
 *
 * The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This responses should be used for temporary conditions and the Retry-After: HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached.
 */
export const SERVICE_UNAVAILABLE = 503;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.2.2
 *
 * This code is sent in response to an Upgrade request header by the client, and indicates the protocol the server is switching too.
 */
export const SWITCHING_PROTOCOLS: InfoStatusCode = 101;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.4.7
 *
 * Server sent this response to directing client to get requested resource to another URI with same method that used prior request. This has the same semantic than the 302 Found HTTP response code, with the exception that the user agent must not change the HTTP method used: if a POST was used in the first request, a POST must be used in the second request.
 */
export const TEMPORARY_REDIRECT = 307;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc6585#section-4
 *
 * The user has sent too many requests in a given amount of time ("rate limiting").
 */
export const TOO_MANY_REQUESTS = 429;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7235#section-3.1
 *
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
 */
export const UNAUTHORIZED: ClientErrorStatusCode = 401;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7725
 *
 * The user-agent requested a resource that cannot legally be provided, such as a web page censored by a government.
 */
export const UNAVAILABLE_FOR_LEGAL_REASONS: ClientErrorStatusCode = 451;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc2518#section-10.3
 *
 * The request was well-formed but was unable to be followed due to semantic errors.
 * - 请求体中的 JSON 数据格式正确，但某些字段的值不符合业务规则（例如，年龄字段的值为负数）
 * - 请求头中的某些字段缺失或格式不正确。
 * - 请求参数的类型不符合预期（例如，期望一个整数，但实际传递的是字符串）
 */
export const UNPROCESSABLE_ENTITY = 422;
/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.13
 *
 * The media format of the requested data is not supported by the server, so the server is rejecting the request.
 */
export const UNSUPPORTED_MEDIA_TYPE: ClientErrorStatusCode = 415;
/**
 * @deprecated
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.4.6
 *
 * Was defined in a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy. It has been deprecated due to security concerns regarding in-band configuration of a proxy.
 */
export const USE_PROXY = 305;
/**
 * Official Documentation @ https://datatracker.ietf.org/doc/html/rfc7540#section-9.1.2
 *
 * Defined in the specification of HTTP/2 to indicate that a server is not able to produce a response for the combination of scheme and authority that are included in the request URI.
 */
export const MISDIRECTED_REQUEST: ClientErrorStatusCode = 421;

const httpStatusCodes = {
  ACCEPTED,
  BAD_GATEWAY,
  BAD_REQUEST,
  CONFLICT,
  CONTINUE,
  CREATED,
  EXPECTATION_FAILED,
  FAILED_DEPENDENCY,
  FORBIDDEN,
  GATEWAY_TIMEOUT,
  GONE,
  HTTP_VERSION_NOT_SUPPORTED,
  IM_A_TEAPOT,
  INSUFFICIENT_SPACE_ON_RESOURCE,
  INSUFFICIENT_STORAGE,
  INTERNAL_SERVER_ERROR,
  LENGTH_REQUIRED,
  LOCKED,
  METHOD_FAILURE,
  METHOD_NOT_ALLOWED,
  MOVED_PERMANENTLY,
  MOVED_TEMPORARILY,
  MULTI_STATUS,
  MULTIPLE_CHOICES,
  NETWORK_AUTHENTICATION_REQUIRED,
  NO_CONTENT,
  NON_AUTHORITATIVE_INFORMATION,
  NOT_ACCEPTABLE,
  NOT_FOUND,
  NOT_IMPLEMENTED,
  NOT_MODIFIED,
  OK,
  PARTIAL_CONTENT,
  PAYMENT_REQUIRED,
  PERMANENT_REDIRECT,
  PRECONDITION_FAILED,
  PRECONDITION_REQUIRED,
  PROCESSING,
  EARLY_HINTS,
  UPGRADE_REQUIRED,
  PROXY_AUTHENTICATION_REQUIRED,
  REQUEST_HEADER_FIELDS_TOO_LARGE,
  REQUEST_TIMEOUT,
  REQUEST_TOO_LONG,
  REQUEST_URI_TOO_LONG,
  REQUESTED_RANGE_NOT_SATISFIABLE,
  RESET_CONTENT,
  SEE_OTHER,
  SERVICE_UNAVAILABLE,
  SWITCHING_PROTOCOLS,
  TEMPORARY_REDIRECT,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
  UNAVAILABLE_FOR_LEGAL_REASONS,
  UNPROCESSABLE_ENTITY,
  UNSUPPORTED_MEDIA_TYPE,
  USE_PROXY,
  MISDIRECTED_REQUEST,
};

export {httpStatusCodes};
export default httpStatusCodes;

// export type InfoStatusCode = 100 | 101 | 102 | 103;
// export type SuccessStatusCode = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;
// export type RedirectStatusCode = 300 | 301 | 302 | 303 | 304 | 305 | 307 | 308;
// export type ClientErrorStatusCode = 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 419 | 420 | 421 | 422 | 423 | 424 | 426 | 428 | 429 | 431 | 451;
// export type ClientErrorStatusCode = 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451
// export type ServerErrorStatusCode = 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

// export type StatusCode = InfoStatusCode | SuccessStatusCode | RedirectStatusCode | ClientErrorStatusCode | ServerErrorStatusCode | UnofficialStatusCode;

export type HttpStatusCodes = typeof httpStatusCodes;