import { Response as Res, CookieOptions, Application, Send, Errback } from "express";
import { ServerResponse, OutgoingHttpHeaders } from "http";
import { Socket } from "net";
import { Readable } from "stream";


export abstract class Response{
    statusCode: number;
    statusMessage: string;
    abstract  assignSocket(socket: Socket): void
    
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
    connection: Socket;
    abstract setTimeout(msecs: number, callback?: () => void): this

    abstract destroy(error: Error): void

    abstract setHeader(name: string, value: string | number | string[]): void

    abstract getHeader(name: string): string | number | string[]

    abstract getHeaders(): OutgoingHttpHeaders

    abstract getHeaderNames(): string[] 

    abstract hasHeader(name: string): boolean

    abstract removeHeader(name: string): void

    addTrailers(headers: OutgoingHttpHeaders | [string, string][]): void {
        throw new Error("Method not implemented.");
    }
    flushHeaders(): void {
        throw new Error("Method not implemented.");
    }
    writable: boolean;
    writableHighWaterMark: number;
    writableLength: number;
    _write(chunk: any, encoding: string, callback: (err?: Error) => void): void {
        throw new Error("Method not implemented.");
    }
    _writev?(chunks: { chunk: any; encoding: string; }[], callback: (err?: Error) => void): void {
        throw new Error("Method not implemented.");
    }
    _destroy(err: Error, callback: Function): void {
        throw new Error("Method not implemented.");
    }
    _final(callback: Function): void {
        throw new Error("Method not implemented.");
    }

    abstract write(chunk: any, cb?: Function): boolean;
    abstract write(chunk: any, encoding?: string, cb?: Function): boolean;
    abstract write(chunk: any, encoding?: any, cb?: any) 

    setDefaultEncoding(encoding: string): this {
        throw new Error("Method not implemented.");
    }
    end(cb?: Function): void;
    end(chunk: any, cb?: Function): void;
    end(chunk: any, encoding?: string, cb?: Function): void;
    end(chunk?: any, encoding?: any, cb?: any) {
        throw new Error("Method not implemented.");
    }
    cork(): void {
        throw new Error("Method not implemented.");
    }
    uncork(): void {
        throw new Error("Method not implemented.");
    }
    abstract addListener(event: string, listener: (...args: any[]) => void): this;
    abstract addListener(event: "close", listener: () => void): this;
    abstract addListener(event: "drain", listener: () => void): this;
    abstract addListener(event: "error", listener: (err: Error) => void): this;
    abstract addListener(event: "finish", listener: () => void): this;
    abstract addListener(event: "pipe", listener: (src: Readable) => void): this;
    abstract addListener(event: "unpipe", listener: (src: Readable) => void): this;
    abstract addListener(event: any, listener: any)

    abstract emit(event: string | symbol, ...args: any[]): boolean;
    abstract emit(event: "close"): boolean;
    abstract emit(event: "drain", chunk: string | Buffer): boolean;
    abstract emit(event: "error", err: Error): boolean;
    abstract emit(event: "finish"): boolean;
    abstract emit(event: "pipe", src: Readable): boolean;
    abstract emit(event: "unpipe", src: Readable): boolean;
    abstract emit(event: any, src?: any, ...rest: any[]) 

    abstract on(event: string, listener: (...args: any[]) => void): this;
    abstract on(event: "close", listener: () => void): this;
    abstract on(event: "drain", listener: () => void): this;
    abstract on(event: "error", listener: (err: Error) => void): this;
    abstract on(event: "finish", listener: () => void): this;
    abstract on(event: "pipe", listener: (src: Readable) => void): this;
    abstract on(event: "unpipe", listener: (src: Readable) => void): this;
    abstract on(event: any, listener: any) 

    abstract once(event: string, listener: (...args: any[]) => void): this;
    abstract once(event: "close", listener: () => void): this;
    abstract once(event: "drain", listener: () => void): this;
    abstract once(event: "error", listener: (err: Error) => void): this;
    abstract once(event: "finish", listener: () => void): this;
    abstract once(event: "pipe", listener: (src: Readable) => void): this;
    abstract once(event: "unpipe", listener: (src: Readable) => void): this;
    abstract once(event: any, listener: any) 
    
    abstract prependListener(event: string, listener: (...args: any[]) => void): this;
    abstract prependListener(event: "close", listener: () => void): this;
    abstract prependListener(event: "drain", listener: () => void): this;
    abstract prependListener(event: "error", listener: (err: Error) => void): this;
    abstract prependListener(event: "finish", listener: () => void): this;
    abstract prependListener(event: "pipe", listener: (src: Readable) => void): this;
    abstract prependListener(event: "unpipe", listener: (src: Readable) => void): this;
    abstract prependListener(event: any, listener: any) 

    abstract prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    abstract prependOnceListener(event: "close", listener: () => void): this;
    abstract prependOnceListener(event: "drain", listener: () => void): this;
    abstract prependOnceListener(event: "error", listener: (err: Error) => void): this;
    abstract prependOnceListener(event: "finish", listener: () => void): this;
    abstract prependOnceListener(event: "pipe", listener: (src: Readable) => void): this;
    abstract prependOnceListener(event: "unpipe", listener: (src: Readable) => void): this;
    abstract prependOnceListener(event: any, listener: any)

    abstract removeListener(event: string, listener: (...args: any[]) => void): this;
    abstract removeListener(event: "close", listener: () => void): this;
    abstract removeListener(event: "drain", listener: () => void): this;
    abstract removeListener(event: "error", listener: (err: Error) => void): this;
    abstract removeListener(event: "finish", listener: () => void): this;
    abstract removeListener(event: "pipe", listener: (src: Readable) => void): this;
    abstract removeListener(event: "unpipe", listener: (src: Readable) => void): this;
    abstract removeListener(event: any, listener: any)

    abstract pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T

    abstract removeAllListeners(event?: string | symbol): this 

    abstract setMaxListeners(n: number): this

    abstract getMaxListeners(): number

    abstract listeners(event: string | symbol): Function[]

    abstract rawListeners(event: string | symbol): Function[]

    abstract eventNames(): (string | symbol)[]

    abstract listenerCount(type: string | symbol): number 

       /**
     * Set status `code`.
     */
    abstract status(code: number): this;

    /**
     * Set the response HTTP status code to `statusCode` and send its string representation as the response body.
     * @link http://expressjs.com/4x/api.html#res.sendStatus
     *
     * Examples:
     *
     *    res.sendStatus(200); // equivalent to res.status(200).send('OK')
     *    res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
     *    res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
     *    res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
     */
    abstract sendStatus(code: number): this;

    /**
     * Set Link header field with the given `links`.
     *
     * Examples:
     *
     *    res.links({
     *      next: 'http://api.example.com/users?page=2',
     *      last: 'http://api.example.com/users?page=5'
     *    });
     */
    abstract links(links: any): Response;

    /**
     * Send a response.
     *
     * Examples:
     *
     *     res.send(new Buffer('wahoo'));
     *     res.send({ some: 'json' });
     *     res.send('<p>some html</p>');
     *     res.send(404, 'Sorry, cant find that');
     *     res.send(404);
     */
    send: Send;

    /**
     * Send JSON response.
     *
     * Examples:
     *
     *     res.json(null);
     *     res.json({ user: 'tj' });
     *     res.json(500, 'oh noes!');
     *     res.json(404, 'I dont have that');
     */
    json: Send;

    /**
     * Send JSON response with JSONP callback support.
     *
     * Examples:
     *
     *     res.jsonp(null);
     *     res.jsonp({ user: 'tj' });
     *     res.jsonp(500, 'oh noes!');
     *     res.jsonp(404, 'I dont have that');
     */
    jsonp: Send;

    /**
     * Transfer the file at the given `path`.
     *
     * Automatically sets the _Content-Type_ response header field.
     * The callback `fn(err)` is invoked when the transfer is complete
     * or when an error occurs. Be sure to check `res.sentHeader`
     * if you wish to attempt responding, as the header and some data
     * may have already been transferred.
     *
     * Options:
     *
     *   - `maxAge`   defaulting to 0 (can be string converted by `ms`)
     *   - `root`     root directory for relative filenames
     *   - `headers`  object of headers to serve with file
     *   - `dotfiles` serve dotfiles, defaulting to false; can be `"allow"` to send them
     *
     * Other options are passed along to `send`.
     *
     * Examples:
     *
     *  The following example illustrates how `res.sendFile()` may
     *  be used as an alternative for the `static()` middleware for
     *  dynamic situations. The code backing `res.sendFile()` is actually
     *  the same code, so HTTP cache support etc is identical.
     *
     *     app.get('/user/:uid/photos/:file', function(req, res){
     *       var uid = req.params.uid
     *         , file = req.params.file;
     *
     *       req.user.mayViewFilesFrom(uid, function(yes){
     *         if (yes) {
     *           res.sendFile('/uploads/' + uid + '/' + file);
     *         } else {
     *           res.send(403, 'Sorry! you cant see that.');
     *         }
     *       });
     *     });
     *
     * @api public
     */
    abstract sendFile(path: string): void;
    abstract sendFile(path: string, options: any): void;
    abstract sendFile(path: string, fn: Errback): void;
    abstract sendFile(path: string, options: any, fn: Errback): void;

    /**
     * @deprecated Use sendFile instead.
     */
    abstract sendfile(path: string): void;
    /**
     * @deprecated Use sendFile instead.
     */
    abstract sendfile(path: string, options: any): void;
    /**
     * @deprecated Use sendFile instead.
     */
    abstract sendfile(path: string, fn: Errback): void;
    /**
     * @deprecated Use sendFile instead.
     */
    abstract sendfile(path: string, options: any, fn: Errback): void;

    /**
     * Transfer the file at the given `path` as an attachment.
     *
     * Optionally providing an alternate attachment `filename`,
     * and optional callback `fn(err)`. The callback is invoked
     * when the data transfer is complete, or when an error has
     * ocurred. Be sure to check `res.headerSent` if you plan to respond.
     *
     * This method uses `res.sendfile()`.
     */
    abstract download(path: string): void;
    abstract download(path: string, filename: string): void;
    abstract download(path: string, fn: Errback): void;
    abstract download(path: string, filename: string, fn: Errback): void;

    /**
     * Set _Content-Type_ response header with `type` through `mime.lookup()`
     * when it does not contain "/", or set the Content-Type to `type` otherwise.
     *
     * Examples:
     *
     *     res.type('.html');
     *     res.type('html');
     *     res.type('json');
     *     res.type('application/json');
     *     res.type('png');
     */
    abstract contentType(type: string): this;

    /**
     * Set _Content-Type_ response header with `type` through `mime.lookup()`
     * when it does not contain "/", or set the Content-Type to `type` otherwise.
     *
     * Examples:
     *
     *     res.type('.html');
     *     res.type('html');
     *     res.type('json');
     *     res.type('application/json');
     *     res.type('png');
     */
    abstract type(type: string): this;

    /**
     * Respond to the Acceptable formats using an `obj`
     * of mime-type callbacks.
     *
     * This method uses `req.accepted`, an array of
     * acceptable types ordered by their quality values.
     * When "Accept" is not present the _first_ callback
     * is invoked, otherwise the first match is used. When
     * no match is performed the server responds with
     * 406 "Not Acceptable".
     *
     * Content-Type is set for you, however if you choose
     * you may alter this within the callback using `res.type()`
     * or `res.set('Content-Type', ...)`.
     *
     *    res.format({
     *      'text/plain': function(){
     *        res.send('hey');
     *      },
     *
     *      'text/html': function(){
     *        res.send('<p>hey</p>');
     *      },
     *
     *      'appliation/json': function(){
     *        res.send({ message: 'hey' });
     *      }
     *    });
     *
     * In addition to canonicalized MIME types you may
     * also use extnames mapped to these types:
     *
     *    res.format({
     *      text: function(){
     *        res.send('hey');
     *      },
     *
     *      html: function(){
     *        res.send('<p>hey</p>');
     *      },
     *
     *      json: function(){
     *        res.send({ message: 'hey' });
     *      }
     *    });
     *
     * By default Express passes an `Error`
     * with a `.status` of 406 to `next(err)`
     * if a match is not made. If you provide
     * a `.default` callback it will be invoked
     * instead.
     */
    abstract format(obj: any): Response;

    /**
     * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
     */
    abstract attachment(filename?: string): Response;

    /**
     * Set header `field` to `val`, or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    res.set('Foo', ['bar', 'baz']);
     *    res.set('Accept', 'application/json');
     *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * Aliased as `res.header()`.
     */
    abstract set(field: any): Response;
    abstract set(field: string, value?: string): Response;

    abstract header(field: any): Response;
    abstract header(field: string, value?: string): Response;

    // Property indicating if HTTP headers has been sent for the response.
    headersSent: boolean;

    /** Get value for header `field`. */
    abstract get(field: string): string;

    /** Clear cookie `name`. */
    abstract clearCookie(name: string, options?: any): Response;

    /**
     * Set cookie `name` to `val`, with the given `options`.
     *
     * Options:
     *
     *    - `maxAge`   max-age in milliseconds, converted to `expires`
     *    - `signed`   sign the cookie
     *    - `path`     defaults to "/"
     *
     * Examples:
     *
     *    // "Remember Me" for 15 minutes
     *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
     *
     *    // save as above
     *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
     */
    abstract cookie(name: string, val: string, options: CookieOptions): Response;
    abstract cookie(name: string, val: any, options: CookieOptions): Response;
    abstract cookie(name: string, val: any): Response;

    /**
     * Set the location header to `url`.
     *
     * The given `url` can also be the name of a mapped url, for
     * example by default express supports "back" which redirects
     * to the _Referrer_ or _Referer_ headers or "/".
     *
     * Examples:
     *
     *    res.location('/foo/bar').;
     *    res.location('http://example.com');
     *    res.location('../login'); // /blog/post/1 -> /blog/login
     *
     * Mounting:
     *
     *   When an application is mounted and `res.location()`
     *   is given a path that does _not_ lead with "/" it becomes
     *   relative to the mount-point. For example if the application
     *   is mounted at "/blog", the following would become "/blog/login".
     *
     *      res.location('login');
     *
     *   While the leading slash would result in a location of "/login":
     *
     *      res.location('/login');
     */
    abstract location(url: string): Response;

    /**
     * Redirect to the given `url` with optional response `status`
     * defaulting to 302.
     *
     * The resulting `url` is determined by `res.location()`, so
     * it will play nicely with mounted apps, relative paths,
     * `"back"` etc.
     *
     * Examples:
     *
     *    res.redirect('/foo/bar');
     *    res.redirect('http://example.com');
     *    res.redirect(301, 'http://example.com');
     *    res.redirect('http://example.com', 301);
     *    res.redirect('../login'); // /blog/post/1 -> /blog/login
     */
    abstract redirect(url: string): void;
    abstract redirect(status: number, url: string): void;
    abstract redirect(url: string, status: number): void;

    /**
     * Render `view` with the given `options` and optional callback `fn`.
     * When a callback function is given a response will _not_ be made
     * automatically, otherwise a response of _200_ and _text/html_ is given.
     *
     * Options:
     *
     *  - `cache`     boolean hinting to the engine it should cache
     *  - `filename`  filename of the view being rendered
     */
    abstract render(view: string, options?: Object, callback?: (err: Error, html: string) => void): void;
    abstract render(view: string, callback?: (err: Error, html: string) => void): void;

    locals: any;

    charset: string;

    /**
     * Adds the field to the Vary response header, if it is not there already.
     * Examples:
     *
     *     res.vary('User-Agent').render('docs');
     *
     */
    abstract vary(field: string): Response;

    app: Application;

    /**
     * Appends the specified value to the HTTP response header field.
     * If the header is not already set, it creates the header with the specified value.
     * The value parameter can be a string or an array.
     *
     * Note: calling res.set() after res.append() will reset the previously-set header value.
     *
     * @since 4.11.0
     */
    abstract append(field: string, value?: string[]|string): Response;
}


