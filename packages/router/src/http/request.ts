import { Application, MediaType, Request as Req } from "express";
import { Socket } from "net";
import { Readable } from "stream";
import { ServerResponse, OutgoingHttpHeaders, IncomingHttpHeaders } from "http";
import { Response } from './response' 


export abstract class Request{

  
    assignSocket(socket: Socket): void {
       
    }
    abstract clearCookie(name: string, options?: any): Response 

    abstract pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T 

 
    

    abstract detachSocket(socket: Socket): void 

    abstract writeContinue(callback?: () => void): void

    abstract writeHead(statusCode: number, reasonPhrase?: string, headers?: OutgoingHttpHeaders): void;
    abstract writeHead(statusCode: number, headers?: OutgoingHttpHeaders): void;
    abstract writeHead(statusCode: any, reasonPhrase?: any, headers?: any)

    upgrading: boolean;
    chunkedEncoding: boolean;
    shouldKeepAlive: boolean;
    useChunkedEncodingByDefault: boolean;
    sendDate: boolean;
    finished: boolean;
    headersSent: boolean;
    abstract setHeader(name: string, value: string | number | string[]): void

    abstract getHeader(name: string): string | number | string[]

    abstract getHeaders(): OutgoingHttpHeaders

    abstract getHeaderNames(): string[]

    abstract hasHeader(name: string): boolean

    abstract removeHeader(name: string): void 

    abstract addTrailers(headers: OutgoingHttpHeaders | [string, string][]): void 

    abstract flushHeaders(): void

    writable: boolean;
    writableHighWaterMark: number;
    writableLength: number;
    abstract _write(chunk: any, encoding: string, callback: (err?: Error) => void): void 

    abstract _writev?(chunks: { chunk: any; encoding: string; }[], callback: (err?: Error) => void): void 

    abstract _final(callback: Function): void

    abstract write(chunk: any, cb?: Function): boolean;
    abstract write(chunk: any, encoding?: string, cb?: Function): boolean;
    abstract write(chunk: any, encoding?: any, cb?: any) 

    abstract setDefaultEncoding(encoding: string): this

    abstract end(cb?: Function): void;
    abstract end(chunk: any, cb?: Function): void;
    abstract end(chunk: any, encoding?: string, cb?: Function): void;
    abstract end(chunk?: any, encoding?: any, cb?: any) 

    abstract cork(): void 
    abstract uncork(): void 

    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    connection: Socket;
    headers: IncomingHttpHeaders;
    rawHeaders: string[];
    trailers: { [key: string]: string; };
    rawTrailers: string[];
    abstract setTimeout(msecs: number, callback: () => void): this 

    statusCode: number;
    statusMessage: string;
    socket: Socket;
    abstract destroy(error?: Error): void

    readable: boolean;
    readableHighWaterMark: number;
    readableLength: number;
    abstract _read(size: number): void 

    abstract read(size?: number) 

    abstract setEncoding(encoding: string): this 

    abstract pause(): this

    abstract resume(): this 

    abstract isPaused(): boolean 

    abstract unpipe<T extends NodeJS.WritableStream>(destination?: T): this 

    abstract unshift(chunk: any): void 

    abstract wrap(oldStream: NodeJS.ReadableStream): this 

    abstract push(chunk: any, encoding?: string): boolean 

    abstract _destroy(err: Error, callback: Function): void 


    abstract addListener(event: string, listener: (...args: any[]) => void): this;
    abstract addListener(event: "close", listener: () => void): this;
    abstract addListener(event: "data", listener: (chunk: string | Buffer) => void): this;
    abstract addListener(event: "end", listener: () => void): this;
    abstract addListener(event: "readable", listener: () => void): this;
    abstract addListener(event: "error", listener: (err: Error) => void): this;
    abstract addListener(event: any, listener: any) 
    
    abstract emit(event: string | symbol, ...args: any[]): boolean;
    abstract emit(event: "close"): boolean;
    abstract emit(event: "data", chunk: string | Buffer): boolean;
    abstract emit(event: "end"): boolean;
    abstract  emit(event: "readable"): boolean;
    abstract emit(event: "error", err: Error): boolean;
    abstract emit(event: any, err?: any, ...rest: any[])
    

    abstract on(event: string, listener: (...args: any[]) => void): this;
    abstract on(event: "close", listener: () => void): this;
    abstract on(event: "data", listener: (chunk: string | Buffer) => void): this;
    abstract on(event: "end", listener: () => void): this;
    abstract on(event: "readable", listener: () => void): this;
    abstract on(event: "error", listener: (err: Error) => void): this;
    abstract on(event: any, listener: any)


    abstract  once(event: string, listener: (...args: any[]) => void): this;
    abstract once(event: "close", listener: () => void): this;
    abstract once(event: "data", listener: (chunk: string | Buffer) => void): this;
    abstract once(event: "end", listener: () => void): this;
    abstract once(event: "readable", listener: () => void): this;
    abstract once(event: "error", listener: (err: Error) => void): this;
    abstract once(event: any, listener: any) 

    abstract prependListener(event: string, listener: (...args: any[]) => void): this;
    abstract prependListener(event: "close", listener: () => void): this;
    abstract  prependListener(event: "data", listener: (chunk: string | Buffer) => void): this;
    abstract prependListener(event: "end", listener: () => void): this;
    abstract prependListener(event: "readable", listener: () => void): this;
    abstract prependListener(event: "error", listener: (err: Error) => void): this;
    abstract prependListener(event: any, listener: any)

    abstract prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    abstract prependOnceListener(event: "close", listener: () => void): this;
    abstract prependOnceListener(event: "data", listener: (chunk: string | Buffer) => void): this;
    abstract prependOnceListener(event: "end", listener: () => void): this;
    abstract prependOnceListener(event: "readable", listener: () => void): this;
    abstract prependOnceListener(event: "error", listener: (err: Error) => void): this;
    abstract prependOnceListener(event: any, listener: any) 


    abstract removeListener(event: string, listener: (...args: any[]) => void): this;
    abstract removeListener(event: "close", listener: () => void): this;
    abstract removeListener(event: "data", listener: (chunk: string | Buffer) => void): this;
    abstract removeListener(event: "end", listener: () => void): this;
    abstract removeListener(event: "readable", listener: () => void): this;
    abstract removeListener(event: "error", listener: (err: Error) => void): this;
    abstract removeListener(event: any, listener: any) 

   
    abstract removeAllListeners(event?: string | symbol): this 

    abstract setMaxListeners(n: number): this 

    abstract getMaxListeners(): number 

    abstract listeners(event: string | symbol): Function[] 

    abstract rawListeners(event: string | symbol): Function[] 

    abstract eventNames(): (string | symbol)[] 

    abstract listenerCount(type: string | symbol): number 

    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable.
     *
     * Examples:
     *
     *     req.get('Content-Type');
     *     // => "text/plain"
     *
     *     req.get('content-type');
     *     // => "text/plain"
     *
     *     req.get('Something');
     *     // => undefined
     *
     * Aliased as `req.header()`.
     */
    abstract get(name: "set-cookie"): string[] | undefined;
    abstract get(name: string): string | undefined;

    abstract header(name: "set-cookie"): string[] | undefined;
    abstract header(name: string): string | undefined;

    /**
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `undefined`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single mime type string
     * such as "application/json", the extension name
     * such as "json", a comma-delimted list such as "json, html, text/plain",
     * or an array `["json", "html", "text/plain"]`. When a list
     * or array is given the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     req.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('html');
     *     // => "html"
     *     req.accepts('text/html');
     *     // => "text/html"
     *     req.accepts('json, text');
     *     // => "json"
     *     req.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('image/png');
     *     req.accepts('png');
     *     // => undefined
     *
     *     // Accept: text/*;q=.5, application/json
     *     req.accepts(['html', 'json']);
     *     req.accepts('html, json');
     *     // => "json"
     */
    abstract accepts(): string[];
    abstract accepts(type: string): string | false;
    abstract accepts(type: string[]): string | false;
    abstract accepts(...type: string[]): string | false;

    /**
     * Returns the first accepted charset of the specified character sets,
     * based on the request's Accept-Charset HTTP header field.
     * If none of the specified charsets is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    abstract acceptsCharsets(): string[];
    abstract acceptsCharsets(charset: string): string | false;
    abstract acceptsCharsets(charset: string[]): string | false;
    abstract acceptsCharsets(...charset: string[]): string | false;

    /**
     * Returns the first accepted encoding of the specified encodings,
     * based on the request's Accept-Encoding HTTP header field.
     * If none of the specified encodings is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    abstract acceptsEncodings(): string[];
    abstract acceptsEncodings(encoding: string): string | false;
    abstract acceptsEncodings(encoding: string[]): string | false;
    abstract acceptsEncodings(...encoding: string[]): string | false;

    /**
     * Returns the first accepted language of the specified languages,
     * based on the request's Accept-Language HTTP header field.
     * If none of the specified languages is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    abstract acceptsLanguages(): string[];
    abstract acceptsLanguages(lang: string): string | false;
    abstract acceptsLanguages(lang: string[]): string | false;
    abstract acceptsLanguages(...lang: string[]): string | false;

    /**
     * Parse Range header field,
     * capping to the given `size`.
     *
     * Unspecified ranges such as "0-" require
     * knowledge of your resource length. In
     * the case of a byte range this is of course
     * the total number of bytes. If the Range
     * header field is not given `null` is returned,
     * `-1` when unsatisfiable, `-2` when syntactically invalid.
     *
     * NOTE: remember that ranges are inclusive, so
     * for example "Range: users=0-3" should respond
     * with 4 users when available, not 3.
     */
    abstract range(size: number): null|-1|-2;

    /**
     * Return an array of Accepted media types
     * ordered from highest quality to lowest.
     */
    accepted: MediaType[];

    /**
     * @deprecated since 4.11 Use either req.params, req.body or req.query, as applicable.
     *
     * Return the value of param `name` when present or `defaultValue`.
     *
     *  - Checks route placeholders, ex: _/user/:id_
     *  - Checks body params, ex: id=12, {"id":12}
     *  - Checks query string params, ex: ?id=12
     *
     * To utilize request bodies, `req.body`
     * should be an object. This can be done by using
     * the `connect.bodyParser()` middleware.
     */
    abstract param(name: string, defaultValue?: any): string;

    /**
     * Check if the incoming request contains the "Content-Type"
     * header field, and it contains the give mime `type`.
     *
     * Examples:
     *
     *      // With Content-Type: text/html; charset=utf-8
     *      req.is('html');
     *      req.is('text/html');
     *      req.is('text/*');
     *      // => true
     *
     *      // When Content-Type is application/json
     *      req.is('json');
     *      req.is('application/json');
     *      req.is('application/*');
     *      // => true
     *
     *      req.is('html');
     *      // => false
     */
    abstract is(type: string): string | false;

    /**
     * Return the protocol string "http" or "https"
     * when requested with TLS. When the "trust proxy"
     * setting is enabled the "X-Forwarded-Proto" header
     * field will be trusted. If you're running behind
     * a reverse proxy that supplies https for you this
     * may be enabled.
     */
    protocol: string;

    /**
     * Short-hand for:
     *
     *    req.protocol == 'https'
     */
    secure: boolean;

    /**
     * Return the remote address, or when
     * "trust proxy" is `true` return
     * the upstream addr.
     */
    ip: string;

    /**
     * When "trust proxy" is `true`, parse
     * the "X-Forwarded-For" ip address list.
     *
     * For example if the value were "client, proxy1, proxy2"
     * you would receive the array `["client", "proxy1", "proxy2"]`
     * where "proxy2" is the furthest down-stream.
     */
    ips: string[];

    /**
     * Return subdomains as an array.
     *
     * Subdomains are the dot-separated parts of the host before the main domain of
     * the app. By default, the domain of the app is assumed to be the last two
     * parts of the host. This can be changed by setting "subdomain offset".
     *
     * For example, if the domain is "tobi.ferrets.example.com":
     * If "subdomain offset" is not set, req.subdomains is `["ferrets", "tobi"]`.
     * If "subdomain offset" is 3, req.subdomains is `["tobi"]`.
     */
    subdomains: string[];

    /**
     * Short-hand for `url.parse(req.url).pathname`.
     */
    path: string;

    /**
     * Parse the "Host" header field hostname.
     */
    hostname: string;

    /**
     * @deprecated Use hostname instead.
     */
    host: string;

    /**
     * Check if the request is fresh, aka
     * Last-Modified and/or the ETag
     * still match.
     */
    fresh: boolean;

    /**
     * Check if the request is stale, aka
     * "Last-Modified" and / or the "ETag" for the
     * resource has changed.
     */
    stale: boolean;

    /**
     * Check if the request was an _XMLHttpRequest_.
     */
    xhr: boolean;

    //body: { username: string; password: string; remember: boolean; title: string; };
    body: any;

    //cookies: { string; remember: boolean; };
    cookies: any;

    method: string;

    params: any;

    query: any;

    route: any;

    signedCookies: any;

    originalUrl: string;

    url: string;

    baseUrl: string;

    app: Application;

    user:any
}


