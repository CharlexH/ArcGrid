var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-eNU87O/functionsWorker-0.42011320823289156.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var compose = /* @__PURE__ */ __name2((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
    __name2(dispatch, "dispatch");
  };
}, "compose");
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
var parseBody = /* @__PURE__ */ __name2(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
__name2(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
__name2(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name2((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name2((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var splitPath = /* @__PURE__ */ __name2((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name2((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name2((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match3, index) => {
    const mark = `@${index}`;
    groups.push([mark, match3]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name2((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name2((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match3 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match3) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match3[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match3[1], new RegExp(`^${match3[2]}(?=/${next})`)] : [label, match3[1], new RegExp(`^${match3[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match3[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name2((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match3) => {
      try {
        return decoder(match3);
      } catch {
        return match3;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name2((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name2((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name2((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name2((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name2((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name2((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name2((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name2((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;
var tryDecodeURIComponent = /* @__PURE__ */ __name2((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  static {
    __name2(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name2((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name2((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name2(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name2((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name2((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  static {
    __name2(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name2((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name2((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name2(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name2((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name2((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name2((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name2((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name2((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name2((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name2((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name2((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name2((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name2((html, arg, headers) => {
    const res = /* @__PURE__ */ __name2((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name2((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name2(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
  static {
    __name2(this, "UnsupportedPathError");
  }
};
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = /* @__PURE__ */ __name2((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name2((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  static {
    __name2(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name2(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name2((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name2((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name2((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name2(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name2((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name2((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name2(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match22 = /* @__PURE__ */ __name2(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match22;
  return match22(method, path);
}
__name(match, "match");
__name2(match, "match");
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
__name2(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  static {
    __name2(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
var Trie = class {
  static {
    __name(this, "Trie");
  }
  static {
    __name2(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
__name2(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
__name2(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes2) {
  const trie = new Trie();
  const handlerData = [];
  if (routes2.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes2.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len22 = handlerData[i].length; j < len22; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
__name2(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
__name2(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  static {
    __name2(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes2 = this.#routes;
    if (!middleware || !routes2) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes2].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes2).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes2[m]).forEach(
            (p) => re.test(p) && routes2[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes2).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes2[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes2[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes2 = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes2.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes2.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes2);
    }
  }
};
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  static {
    __name2(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes2 = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len22 = routes2.length; i2 < len22; i2++) {
          router.add(...routes2[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name2((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = class _Node2 {
  static {
    __name(this, "_Node2");
  }
  static {
    __name2(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len22 = handlerSet.possibleKeys.length; i2 < len22; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len22 = curNodes.length; j < len22; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  static {
    __name2(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono2");
  }
  static {
    __name2(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};
var handle = /* @__PURE__ */ __name2((app2) => (eventContext) => {
  return app2.fetch(
    eventContext.request,
    { ...eventContext.env, eventContext },
    {
      waitUntil: eventContext.waitUntil,
      passThroughOnException: eventContext.passThroughOnException,
      props: {}
    }
  );
}, "handle");
var ApiFailure = class extends Error {
  static {
    __name(this, "ApiFailure");
  }
  static {
    __name2(this, "ApiFailure");
  }
  constructor(status, errorCode, errorMessage) {
    super(errorMessage);
    this.name = "ApiFailure";
    this.status = status;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }
  toJSON() {
    return {
      errorCode: this.errorCode,
      errorMessage: this.errorMessage
    };
  }
};
var PATH_TAG_REGEX = /<path\b[^>]*>/gi;
var POLYGON_TAG_REGEX = /<polygon\b[^>]*>/gi;
var POLYLINE_TAG_REGEX = /<polyline\b[^>]*>/gi;
var RECT_TAG_REGEX = /<rect\b[^>]*>/gi;
var CIRCLE_TAG_REGEX = /<circle\b[^>]*>/gi;
var ELLIPSE_TAG_REGEX = /<ellipse\b[^>]*>/gi;
var LINE_TAG_REGEX = /<line\b[^>]*>/gi;
function extractAttr(tag, name) {
  const regex = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
  const match3 = tag.match(regex);
  return match3 ? match3[2] : null;
}
__name(extractAttr, "extractAttr");
__name2(extractAttr, "extractAttr");
function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
__name(parseNumber, "parseNumber");
__name2(parseNumber, "parseNumber");
function parsePointsAttr(pointsText) {
  if (!pointsText) return [];
  const numbers = pointsText.replace(/,/g, " ").trim().match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
  if (!numbers || numbers.length < 2) return [];
  const points = [];
  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = Number(numbers[i]);
    const y = Number(numbers[i + 1]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ anchor: [x, y], leftDirection: [x, y], rightDirection: [x, y] });
    }
  }
  return points;
}
__name(parsePointsAttr, "parsePointsAttr");
__name2(parsePointsAttr, "parsePointsAttr");
function parsePathPoints(d) {
  const tokens = d.replace(/,/g, " ").trim().match(/[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
  if (!tokens || tokens.length === 0) return [];
  const points = [];
  let i = 0;
  let x = 0, y = 0;
  let cmd = "M";
  let startX = 0, startY = 0;
  const pushAnchor = /* @__PURE__ */ __name2((nx, ny, h1, h2) => {
    if (Number.isFinite(nx) && Number.isFinite(ny)) {
      if (points.length === 0) {
        startX = nx;
        startY = ny;
      }
      if (points.length > 0 && h1) {
        points[points.length - 1].rightDirection = [h1.x, h1.y];
      }
      x = nx;
      y = ny;
      points.push({
        anchor: [x, y],
        leftDirection: h2 ? [h2.x, h2.y] : [x, y],
        rightDirection: [x, y]
      });
    }
  }, "pushAnchor");
  while (i < tokens.length) {
    const token = tokens[i];
    if (/^[AaCcHhLlMmQqSsTtVvZz]$/.test(token)) {
      cmd = token;
      i += 1;
      if (cmd === "Z" || cmd === "z") {
        pushAnchor(startX, startY);
      }
      continue;
    }
    if (cmd === "M" || cmd === "L" || cmd === "T") {
      pushAnchor(Number(tokens[i]), Number(tokens[i + 1]));
      i += 2;
      continue;
    }
    if (cmd === "m" || cmd === "l" || cmd === "t") {
      pushAnchor(x + Number(tokens[i]), y + Number(tokens[i + 1]));
      i += 2;
      continue;
    }
    if (cmd === "H") {
      pushAnchor(Number(tokens[i]), y);
      i += 1;
      continue;
    }
    if (cmd === "h") {
      pushAnchor(x + Number(tokens[i]), y);
      i += 1;
      continue;
    }
    if (cmd === "V") {
      pushAnchor(x, Number(tokens[i]));
      i += 1;
      continue;
    }
    if (cmd === "v") {
      pushAnchor(x, y + Number(tokens[i]));
      i += 1;
      continue;
    }
    if (cmd === "C") {
      const cx1 = Number(tokens[i]);
      const cy1 = Number(tokens[i + 1]);
      const cx2 = Number(tokens[i + 2]);
      const cy2 = Number(tokens[i + 3]);
      const nx = Number(tokens[i + 4]);
      const ny = Number(tokens[i + 5]);
      pushAnchor(nx, ny, { x: cx1, y: cy1 }, { x: cx2, y: cy2 });
      i += 6;
      continue;
    }
    if (cmd === "c") {
      const cx1 = x + Number(tokens[i]);
      const cy1 = y + Number(tokens[i + 1]);
      const cx2 = x + Number(tokens[i + 2]);
      const cy2 = y + Number(tokens[i + 3]);
      const nx = x + Number(tokens[i + 4]);
      const ny = y + Number(tokens[i + 5]);
      pushAnchor(nx, ny, { x: cx1, y: cy1 }, { x: cx2, y: cy2 });
      i += 6;
      continue;
    }
    if (cmd === "S" || cmd === "Q" || cmd === "s" || cmd === "q") {
      pushAnchor(Number(tokens[i + 2]), Number(tokens[i + 3]));
      i += 4;
      continue;
    }
    if (cmd === "A" || cmd === "a") {
      pushAnchor(Number(tokens[i + 5]), Number(tokens[i + 6]));
      i += 7;
      continue;
    }
    i += 1;
  }
  return points;
}
__name(parsePathPoints, "parsePathPoints");
__name2(parsePathPoints, "parsePathPoints");
function parsePolygonLike(svgText, regex, closedDefault, idPrefix, startIndex) {
  const results = [];
  let match3;
  let index = startIndex;
  while ((match3 = regex.exec(svgText)) !== null) {
    const tag = match3[0];
    const points = parsePointsAttr(extractAttr(tag, "points"));
    if (points.length < 2) continue;
    const closed = closedDefault || points.length > 2;
    if (closed) {
      points.push(JSON.parse(JSON.stringify(points[0])));
    }
    results.push({
      id: `${idPrefix}_${index}`,
      d: "",
      points,
      closed
    });
    index += 1;
  }
  return { items: results, nextIndex: index };
}
__name(parsePolygonLike, "parsePolygonLike");
__name2(parsePolygonLike, "parsePolygonLike");
function parseRectangles(svgText, startIndex) {
  const results = [];
  let index = startIndex;
  let match3;
  while ((match3 = RECT_TAG_REGEX.exec(svgText)) !== null) {
    const tag = match3[0];
    const x = parseNumber(extractAttr(tag, "x"), 0);
    const y = parseNumber(extractAttr(tag, "y"), 0);
    const width = parseNumber(extractAttr(tag, "width"), 0);
    const height = parseNumber(extractAttr(tag, "height"), 0);
    if (width <= 0 || height <= 0) continue;
    const points = [
      { anchor: [x, y], leftDirection: [x, y], rightDirection: [x, y] },
      { anchor: [x + width, y], leftDirection: [x + width, y], rightDirection: [x + width, y] },
      { anchor: [x + width, y + height], leftDirection: [x + width, y + height], rightDirection: [x + width, y + height] },
      { anchor: [x, y + height], leftDirection: [x, y + height], rightDirection: [x, y + height] },
      { anchor: [x, y], leftDirection: [x, y], rightDirection: [x, y] }
    ];
    results.push({ id: `rect_${index}`, d: "", points, closed: true });
    index += 1;
  }
  return { items: results, nextIndex: index };
}
__name(parseRectangles, "parseRectangles");
__name2(parseRectangles, "parseRectangles");
function parseCircles(svgText, startIndex) {
  const results = [];
  let index = startIndex;
  let match3;
  while ((match3 = CIRCLE_TAG_REGEX.exec(svgText)) !== null) {
    const tag = match3[0];
    const cx = parseNumber(extractAttr(tag, "cx"), 0);
    const cy = parseNumber(extractAttr(tag, "cy"), 0);
    const r = parseNumber(extractAttr(tag, "r"), 0);
    if (r <= 0) continue;
    const k = 0.552284749831 * r;
    const points = [
      { anchor: [cx, cy - r], leftDirection: [cx - k, cy - r], rightDirection: [cx + k, cy - r] },
      { anchor: [cx + r, cy], leftDirection: [cx + r, cy - k], rightDirection: [cx + r, cy + k] },
      { anchor: [cx, cy + r], leftDirection: [cx + k, cy + r], rightDirection: [cx - k, cy + r] },
      { anchor: [cx - r, cy], leftDirection: [cx - r, cy + k], rightDirection: [cx - r, cy - k] },
      { anchor: [cx, cy - r], leftDirection: [cx - k, cy - r], rightDirection: [cx + k, cy - r] }
    ];
    results.push({ id: `circle_${index}`, d: "", points, closed: true });
    index += 1;
  }
  return { items: results, nextIndex: index };
}
__name(parseCircles, "parseCircles");
__name2(parseCircles, "parseCircles");
function parseEllipses(svgText, startIndex) {
  const results = [];
  let index = startIndex;
  let match3;
  while ((match3 = ELLIPSE_TAG_REGEX.exec(svgText)) !== null) {
    const tag = match3[0];
    const cx = parseNumber(extractAttr(tag, "cx"), 0);
    const cy = parseNumber(extractAttr(tag, "cy"), 0);
    const rx = parseNumber(extractAttr(tag, "rx"), 0);
    const ry = parseNumber(extractAttr(tag, "ry"), 0);
    if (rx <= 0 || ry <= 0) continue;
    const kx = 0.552284749831 * rx;
    const ky = 0.552284749831 * ry;
    const points = [
      { anchor: [cx, cy - ry], leftDirection: [cx - kx, cy - ry], rightDirection: [cx + kx, cy - ry] },
      { anchor: [cx + rx, cy], leftDirection: [cx + rx, cy - ky], rightDirection: [cx + rx, cy + ky] },
      { anchor: [cx, cy + ry], leftDirection: [cx + kx, cy + ry], rightDirection: [cx - kx, cy + ry] },
      { anchor: [cx - rx, cy], leftDirection: [cx - rx, cy + ky], rightDirection: [cx - rx, cy - ky] },
      { anchor: [cx, cy - ry], leftDirection: [cx - kx, cy - ry], rightDirection: [cx + kx, cy - ry] }
    ];
    results.push({ id: `ellipse_${index}`, d: "", points, closed: true });
    index += 1;
  }
  return { items: results, nextIndex: index };
}
__name(parseEllipses, "parseEllipses");
__name2(parseEllipses, "parseEllipses");
function parseLines(svgText, startIndex) {
  const results = [];
  let index = startIndex;
  let match3;
  while ((match3 = LINE_TAG_REGEX.exec(svgText)) !== null) {
    const tag = match3[0];
    const x1 = parseNumber(extractAttr(tag, "x1"), 0);
    const y1 = parseNumber(extractAttr(tag, "y1"), 0);
    const x2 = parseNumber(extractAttr(tag, "x2"), 0);
    const y2 = parseNumber(extractAttr(tag, "y2"), 0);
    if (x1 === x2 && y1 === y2) continue;
    results.push({
      id: `line_${index}`,
      d: "",
      points: [
        { anchor: [x1, y1], leftDirection: [x1, y1], rightDirection: [x1, y1] },
        { anchor: [x2, y2], leftDirection: [x2, y2], rightDirection: [x2, y2] }
      ],
      closed: false
    });
    index += 1;
  }
  return { items: results, nextIndex: index };
}
__name(parseLines, "parseLines");
__name2(parseLines, "parseLines");
function parseSvg(svgText) {
  if (typeof svgText !== "string" || !svgText.includes("<svg")) {
    throw new ApiFailure(400, "INVALID_SVG", "SVG payload is missing or invalid.");
  }
  const cleanedSvg = svgText.replace(/<defs[\s\S]*?<\/defs>/gi, "").replace(/<clipPath[\s\S]*?<\/clipPath>/gi, "");
  const paths = [];
  let index = 1;
  let match3;
  while ((match3 = PATH_TAG_REGEX.exec(cleanedSvg)) !== null) {
    const tag = match3[0];
    const d = extractAttr(tag, "d");
    if (!d) continue;
    const points = parsePathPoints(d);
    const closed = /z\s*$/i.test(d.trim());
    if (points.length > 1) {
      paths.push({
        id: `path_${index}`,
        d,
        points,
        closed
      });
      index += 1;
    }
  }
  const polygon = parsePolygonLike(cleanedSvg, POLYGON_TAG_REGEX, true, "polygon", index);
  paths.push(...polygon.items);
  index = polygon.nextIndex;
  const polyline = parsePolygonLike(cleanedSvg, POLYLINE_TAG_REGEX, false, "polyline", index);
  paths.push(...polyline.items);
  index = polyline.nextIndex;
  const rects = parseRectangles(cleanedSvg, index);
  paths.push(...rects.items);
  index = rects.nextIndex;
  const circles = parseCircles(cleanedSvg, index);
  paths.push(...circles.items);
  index = circles.nextIndex;
  const ellipses = parseEllipses(cleanedSvg, index);
  paths.push(...ellipses.items);
  index = ellipses.nextIndex;
  const lines = parseLines(cleanedSvg, index);
  paths.push(...lines.items);
  if (paths.length === 0) {
    throw new ApiFailure(400, "INVALID_SVG", "No supported geometry found in SVG.");
  }
  const mockId = svgText.includes("MOCK_LOGO_ARCGRID_V1") ? "MOCK_LOGO_ARCGRID_V1" : null;
  return {
    raw: svgText,
    paths,
    mockId
  };
}
__name(parseSvg, "parseSvg");
__name2(parseSvg, "parseSvg");
function normalizePaths(paths) {
  const allPoints = paths.flatMap((path) => path.points.map((p) => p.anchor));
  const minX = Math.min(...allPoints.map((p) => p[0]));
  const minY = Math.min(...allPoints.map((p) => p[1]));
  const maxX = Math.max(...allPoints.map((p) => p[0]));
  const maxY = Math.max(...allPoints.map((p) => p[1]));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  return {
    paths,
    // keep original unscaled path control points
    bbox: {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      cx: minX + width / 2,
      cy: minY + height / 2,
      actualWidth: width,
      actualHeight: height
    }
  };
}
__name(normalizePaths, "normalizePaths");
__name2(normalizePaths, "normalizePaths");
function rot90(v) {
  return [-v[1], v[0]];
}
__name(rot90, "rot90");
__name2(rot90, "rot90");
function lineIntersectionPointDir(p, v, q, w) {
  const denom = v[0] * w[1] - v[1] * w[0];
  if (Math.abs(denom) < 1e-9) return null;
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const t = (dx * w[1] - dy * w[0]) / denom;
  return [p[0] + v[0] * t, p[1] + v[1] * t];
}
__name(lineIntersectionPointDir, "lineIntersectionPointDir");
__name2(lineIntersectionPointDir, "lineIntersectionPointDir");
function isStraightSegment(pt1, pt2) {
  const epsilon = 1e-3;
  const rDx = Math.abs(pt1.rightDirection[0] - pt1.anchor[0]);
  const rDy = Math.abs(pt1.rightDirection[1] - pt1.anchor[1]);
  const lDx = Math.abs(pt2.leftDirection[0] - pt2.anchor[0]);
  const lDy = Math.abs(pt2.leftDirection[1] - pt2.anchor[1]);
  return rDx < epsilon && rDy < epsilon && lDx < epsilon && lDy < epsilon;
}
__name(isStraightSegment, "isStraightSegment");
__name2(isStraightSegment, "isStraightSegment");
function getCircleCenterFrom2AnchorArc(p1, h1, p3, h2) {
  const t1 = [h1[0] - p1[0], h1[1] - p1[1]];
  const t2 = [p3[0] - h2[0], p3[1] - h2[1]];
  const n1 = rot90(t1);
  const n2 = rot90(t2);
  return lineIntersectionPointDir(p1, n1, p3, n2);
}
__name(getCircleCenterFrom2AnchorArc, "getCircleCenterFrom2AnchorArc");
__name2(getCircleCenterFrom2AnchorArc, "getCircleCenterFrom2AnchorArc");
function drawLineAcrossBoundaries(p1, p2, left, top, right, bottom) {
  const x1 = p1[0], y1 = p1[1];
  const x2 = p2[0], y2 = p2[1];
  const intersections = [];
  const epsilon = 1e-3;
  if (Math.abs(x1 - x2) < epsilon) {
    intersections.push([x1, top]);
    intersections.push([x1, bottom]);
  } else if (Math.abs(y1 - y2) < epsilon) {
    intersections.push([left, y1]);
    intersections.push([right, y1]);
  } else {
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;
    const minX = Math.min(left, right);
    const maxX = Math.max(left, right);
    const minY = Math.min(top, bottom);
    const maxY = Math.max(top, bottom);
    const yAtLeft = m * minX + b;
    if (yAtLeft >= minY - epsilon && yAtLeft <= maxY + epsilon) intersections.push([minX, yAtLeft]);
    const yAtRight = m * maxX + b;
    if (yAtRight >= minY - epsilon && yAtRight <= maxY + epsilon) intersections.push([maxX, yAtRight]);
    const xAtTop = (minY - b) / m;
    if (xAtTop >= minX - epsilon && xAtTop <= maxX + epsilon) intersections.push([xAtTop, minY]);
    const xAtBottom = (maxY - b) / m;
    if (xAtBottom >= minX - epsilon && xAtBottom <= maxX + epsilon) intersections.push([xAtBottom, maxY]);
  }
  if (intersections.length >= 2) {
    const uniquePoints = [intersections[0]];
    for (let j = 1; j < intersections.length; j++) {
      const dx = intersections[j][0] - uniquePoints[0][0];
      const dy = intersections[j][1] - uniquePoints[0][1];
      if (Math.sqrt(dx * dx + dy * dy) > epsilon) {
        uniquePoints.push(intersections[j]);
        break;
      }
    }
    if (uniquePoints.length >= 2) {
      return uniquePoints.slice(0, 2);
    }
  }
  return null;
}
__name(drawLineAcrossBoundaries, "drawLineAcrossBoundaries");
__name2(drawLineAcrossBoundaries, "drawLineAcrossBoundaries");
function makeLineKey(a, b) {
  const pointKey = /* @__PURE__ */ __name2((p) => `${Number(p[0]).toFixed(3)},${Number(p[1]).toFixed(3)}`, "pointKey");
  const ka = pointKey(a);
  const kb = pointKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}
__name(makeLineKey, "makeLineKey");
__name2(makeLineKey, "makeLineKey");
function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
__name(dot2, "dot2");
__name2(dot2, "dot2");
function len2(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}
__name(len2, "len2");
__name2(len2, "len2");
function sub2(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
__name(sub2, "sub2");
__name2(sub2, "sub2");
function cubicBezierPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;
  return [
    uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
    uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1]
  ];
}
__name(cubicBezierPoint, "cubicBezierPoint");
__name2(cubicBezierPoint, "cubicBezierPoint");
function isApproxCircularArc(p1, h1, h2, p3, center, radius, toleranceMult = 1) {
  if (!center || !(radius > 0)) return false;
  const tol = Math.max(0.2, radius * 0.01) * toleranceMult;
  const d1 = len2(sub2(p1, center));
  const d3 = len2(sub2(p3, center));
  if (Math.abs(d1 - radius) > tol) return false;
  if (Math.abs(d3 - radius) > tol) return false;
  const mid = cubicBezierPoint(p1, h1, h2, p3, 0.5);
  const dm = len2(sub2(mid, center));
  if (Math.abs(dm - radius) > tol) return false;
  const t1 = sub2(h1, p1);
  const t2 = sub2(p3, h2);
  const r1 = sub2(p1, center);
  const r3 = sub2(p3, center);
  if (len2(t1) < 1e-6 || len2(t2) < 1e-6) return false;
  const dot1 = dot2(r1, t1);
  const dot2Val = dot2(r3, t2);
  if (Math.abs(dot1) > tol * len2(t1)) return false;
  if (Math.abs(dot2Val) > tol * len2(t2)) return false;
  return true;
}
__name(isApproxCircularArc, "isApproxCircularArc");
__name2(isApproxCircularArc, "isApproxCircularArc");
function getGeometricGuides(paths, bbox, mode, toleranceMult = 1, shouldDedup = true) {
  const lines = [];
  const circles = [];
  const lineKeys = /* @__PURE__ */ new Set();
  const circleKeys = /* @__PURE__ */ new Set();
  for (const path of paths) {
    const pts = path.points;
    if (!pts || pts.length < 2) continue;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      if (!path.closed && i === n - 1) break;
      const pt1 = pts[i];
      const pt2 = pts[(i + 1) % n];
      const isStraight = isStraightSegment(pt1, pt2);
      if (isStraight && (mode === "ALL" || mode === "STRAIGHT")) {
        const intersections = drawLineAcrossBoundaries(
          pt1.anchor,
          pt2.anchor,
          bbox.minX,
          bbox.minY,
          bbox.maxX,
          bbox.maxY
        );
        if (intersections && intersections.length === 2) {
          const key = makeLineKey(intersections[0], intersections[1]);
          if (!shouldDedup || !lineKeys.has(key)) {
            lineKeys.add(key);
            lines.push({
              x1: intersections[0][0],
              y1: intersections[0][1],
              x2: intersections[1][0],
              y2: intersections[1][1],
              role: "axis"
            });
          }
        }
      }
      if (!isStraight && (mode === "ALL" || mode === "CURVE")) {
        const center = getCircleCenterFrom2AnchorArc(
          pt1.anchor,
          pt1.rightDirection,
          pt2.anchor,
          pt2.leftDirection
        );
        if (center) {
          const dx = pt1.anchor[0] - center[0];
          const dy = pt1.anchor[1] - center[1];
          const radius = Math.sqrt(dx * dx + dy * dy);
          if (radius > 0 && isApproxCircularArc(pt1.anchor, pt1.rightDirection, pt2.leftDirection, pt2.anchor, center, radius, toleranceMult)) {
            const key = `${center[0].toFixed(3)},${center[1].toFixed(3)},${radius.toFixed(3)}`;
            if (!shouldDedup || !circleKeys.has(key)) {
              circleKeys.add(key);
              circles.push({
                cx: center[0],
                cy: center[1],
                r: radius,
                role: "construction"
              });
            }
          }
        }
      }
    }
  }
  return { lines, circles };
}
__name(getGeometricGuides, "getGeometricGuides");
__name2(getGeometricGuides, "getGeometricGuides");
function generateCandidates({ paths, bbox, strategy, constraints = {}, mockId }) {
  const toleranceMult = constraints.toleranceMult ?? 1;
  if (mockId === "MOCK_LOGO_ARCGRID_V1") {
    return [
      {
        id: "cand_mock_auto",
        label: "Auto Balanced",
        circles: [
          { cx: bbox.cx, cy: bbox.cy, r: Math.min(bbox.width, bbox.height) * 0.5, role: "fit" },
          { cx: bbox.cx, cy: bbox.cy, r: Math.min(bbox.width, bbox.height) * 0.35, role: "construction" }
        ],
        lines: [
          { x1: bbox.cx, y1: bbox.minY, x2: bbox.cx, y2: bbox.maxY, role: "axis" },
          { x1: bbox.minX, y1: bbox.cy, x2: bbox.maxX, y2: bbox.cy, role: "axis" }
        ],
        metrics: { fitError: 0.1122, symmetryScore: 0.934, complexityPenalty: 0.171, finalScore: 0.8731 },
        explanation: "Balanced circle+grid constraints with central symmetry anchor."
      }
    ];
  }
  const allGeom = getGeometricGuides(paths, bbox, "ALL", toleranceMult, true);
  const straightGeom = getGeometricGuides(paths, bbox, "STRAIGHT", toleranceMult, true);
  const curveGeom = getGeometricGuides(paths, bbox, "CURVE", toleranceMult, true);
  const calcComplexity = /* @__PURE__ */ __name2((g) => Math.min(1, (g.lines.length + g.circles.length) * 0.05), "calcComplexity");
  const autoCand = {
    id: "cand_geometry_auto",
    label: "Full Construction",
    circles: allGeom.circles,
    lines: allGeom.lines,
    metrics: {
      fitError: 0.1,
      symmetryScore: 0.9,
      complexityPenalty: calcComplexity(allGeom),
      finalScore: Math.max(0.1, 0.95 - calcComplexity(allGeom) * 0.3)
    },
    explanation: "Extracts all straight guide extensions and underlying circular origins."
  };
  const curvesCand = {
    id: "cand_geometry_circles",
    label: "Circles Only (Curves)",
    circles: curveGeom.circles,
    lines: curveGeom.lines,
    // will be empty
    metrics: {
      fitError: 0.15,
      symmetryScore: 0.85,
      complexityPenalty: calcComplexity(curveGeom),
      finalScore: Math.max(0.1, 0.85 - calcComplexity(curveGeom) * 0.3)
    },
    explanation: "Focuses exclusively on reconstructing origins for bezier curves."
  };
  const linesCand = {
    id: "cand_geometry_lines",
    label: "Lines Only (Straight)",
    circles: straightGeom.circles,
    // will be empty
    lines: straightGeom.lines,
    metrics: {
      fitError: 0.2,
      symmetryScore: 0.8,
      complexityPenalty: calcComplexity(straightGeom),
      finalScore: Math.max(0.1, 0.8 - calcComplexity(straightGeom) * 0.3)
    },
    explanation: "Limits extraction to boundary-extended straight segments only."
  };
  const curvesCount = curveGeom.circles.length;
  const linesCount = straightGeom.lines.length;
  if (curvesCount > 0 && curvesCount >= linesCount * 0.5) {
    return [curvesCand, autoCand, linesCand];
  } else if (linesCount > 0 && linesCount > curvesCount * 2) {
    return [linesCand, autoCand, curvesCand];
  }
  return [autoCand, curvesCand, linesCand];
}
__name(generateCandidates, "generateCandidates");
__name2(generateCandidates, "generateCandidates");
var DEFAULT_WEIGHTS = {
  fit: 0.45,
  symmetry: 0.4,
  complexity: 0.15
};
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
__name(clamp, "clamp");
__name2(clamp, "clamp");
function round4(value) {
  return Number(value.toFixed(4));
}
__name(round4, "round4");
__name2(round4, "round4");
function optimizeCandidates(candidates, constraints = {}) {
  const weights = {
    fit: constraints.fitWeight ?? DEFAULT_WEIGHTS.fit,
    symmetry: constraints.symmetryWeight ?? DEFAULT_WEIGHTS.symmetry,
    complexity: constraints.complexityWeight ?? DEFAULT_WEIGHTS.complexity
  };
  const solved = candidates.map((candidate) => {
    const current = candidate.metrics;
    if (candidate.id.startsWith("cand_mock_")) {
      return candidate;
    }
    const finalScore = clamp(
      1 - current.fitError * weights.fit + current.symmetryScore * weights.symmetry - current.complexityPenalty * weights.complexity,
      0,
      1
    );
    return {
      ...candidate,
      metrics: {
        fitError: round4(current.fitError),
        symmetryScore: round4(current.symmetryScore),
        complexityPenalty: round4(current.complexityPenalty),
        finalScore: round4(finalScore)
      }
    };
  });
  return solved.sort((a, b) => b.metrics.finalScore - a.metrics.finalScore);
}
__name(optimizeCandidates, "optimizeCandidates");
__name2(optimizeCandidates, "optimizeCandidates");
var SOLVER_SIGNATURE = "GEOMETRIC_SOLVER=AG27";
var DEFAULT_TIMEOUT_MS = 15e3;
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso, "nowIso");
__name2(nowIso, "nowIso");
function buildConstraintGraph(candidates) {
  const nodes = [];
  const edges = [];
  candidates.forEach((candidate) => {
    candidate.circles.forEach((circle, idx) => {
      const id = `${candidate.id}_circle_${idx + 1}`;
      nodes.push({ id, type: "circle" });
      edges.push({ from: candidate.id, to: id, relation: circle.role, weight: 1 });
    });
    candidate.lines.forEach((line, idx) => {
      const id = `${candidate.id}_line_${idx + 1}`;
      nodes.push({ id, type: "line" });
      edges.push({ from: candidate.id, to: id, relation: line.role, weight: 0.8 });
    });
  });
  return { nodes, edges };
}
__name(buildConstraintGraph, "buildConstraintGraph");
__name2(buildConstraintGraph, "buildConstraintGraph");
function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
__name(randomId, "randomId");
__name2(randomId, "randomId");
function analyzeLogo({ svgText, strategy = "auto", constraints = {} }) {
  const startedAt = Date.now();
  const parsed = parseSvg(svgText);
  const normalized = normalizePaths(parsed.paths);
  const candidates = generateCandidates({
    paths: normalized.paths,
    bbox: normalized.bbox,
    strategy,
    constraints,
    mockId: parsed.mockId
  });
  if (!candidates.length) {
    throw new ApiFailure(422, "UNSOLVABLE_GEOMETRY", "No candidate guides could be generated.");
  }
  const solved = optimizeCandidates(candidates, constraints);
  const bestSolution = solved[0];
  if (!bestSolution || bestSolution.metrics.finalScore < (constraints.minScore ?? 0.5)) {
    throw new ApiFailure(422, "UNSOLVABLE_GEOMETRY", "Generated candidates did not meet minimum quality threshold.");
  }
  if (Date.now() - startedAt > (constraints.timeoutMs ?? DEFAULT_TIMEOUT_MS)) {
    throw new ApiFailure(504, "SOLVER_TIMEOUT", "Solver exceeded timeout budget.");
  }
  return {
    analysisId: parsed.mockId ? "mock-result" : randomId("anl"),
    createdAt: nowIso(),
    signature: SOLVER_SIGNATURE,
    strategy,
    input: {
      mockId: parsed.mockId,
      paths: parsed.paths,
      bbox: normalized.bbox,
      raw: parsed.raw
    },
    constraintGraph: buildConstraintGraph(solved),
    bestSolution,
    candidates: solved,
    metrics: bestSolution.metrics
  };
}
__name(analyzeLogo, "analyzeLogo");
__name2(analyzeLogo, "analyzeLogo");
var solverSignature = SOLVER_SIGNATURE;
var SYSTEM_PROMPT_VECTORIZE = `
You are an expert graphic designer and SVG coder.
Your task is to analyze the provided logo image and convert it into a clean, precise, and well-structured SVG format.
Output ONLY valid SVG code.
Do not include markdown formatting or any other text (like \`\`\`svg).
The SVG must be strictly geometric, using paths and basic shapes.
Use a clean viewBox (e.g., "0 0 512 512" or similar based on the image proportions).
`;
var MOCK_VECTOR_SVG = `
<svg id="MOCK_LOGO_ARCGRID_V1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#111" stroke-width="20">
    <path d="M96 384 L96 128 L256 128 L416 384 Z" />
    <path d="M176 300 L256 172 L336 300 Z" />
  </g>
</svg>
`.trim();
async function tryGeminiVectorize({ imageBase64, imageUrl, mimeType, options = {} }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiFailure(500, "CONFIG_ERROR", "GEMINI_API_KEY is not configured in environment.");
  }
  if (typeof fetch !== "function") {
    throw new ApiFailure(424, "VECTORIZATION_FAILED", "Runtime fetch API unavailable.");
  }
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT_VECTORIZE }]
    },
    contents: [{
      parts: [
        { text: "Convert this logo to a clean SVG following the instructions." }
      ]
    }]
  };
  if (imageBase64) {
    const resolvedMimeType = mimeType || "image/jpeg";
    console.log(`[vectorize] Using mimeType: ${resolvedMimeType}`);
    payload.contents[0].parts.push({
      inlineData: {
        mimeType: resolvedMimeType,
        data: imageBase64
      }
    });
  } else {
    throw new ApiFailure(400, "INVALID_REQUEST", "imageUrl is not supported by this proxy yet, need imageBase64.");
  }
  let response;
  let lastError;
  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1e3 + Math.random() * 1e3;
        console.log(`Retrying Gemini API (attempt ${attempt}/${maxRetries}) after ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        break;
      }
      const errorText = await response.text();
      console.error(`Gemini API Error (Status ${response.status}):`, errorText);
      if (response.status === 429 && attempt < maxRetries) {
        continue;
      }
      throw new ApiFailure(
        response.status === 429 ? 429 : 424,
        response.status === 429 ? "RATE_LIMIT" : "VECTORIZATION_FAILED",
        `Gemini API failed with status ${response.status}.`
      );
    } catch (e) {
      lastError = e;
      if (e instanceof ApiFailure && e.status === 429 && attempt < maxRetries) {
        continue;
      }
      throw e;
    }
  }
  if (!response || !response.ok) {
    throw lastError || new ApiFailure(424, "VECTORIZATION_FAILED", "Gemini API call failed after retries.");
  }
  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  console.log(`[vectorize] Response has ${parts.length} part(s):`, parts.map((p, i) => `part[${i}] thought=${!!p.thought} hasText=${!!p.text}`).join(", "));
  let textOutput = null;
  for (const part of parts) {
    if (part.text && !part.thought) {
      textOutput = part.text;
    }
  }
  if (!textOutput) {
    console.error("[vectorize] No valid text output found in response parts:", JSON.stringify(parts.map((p) => ({ thought: p.thought, textLen: p.text?.length }))));
    throw new ApiFailure(424, "VECTORIZATION_FAILED", "Gemini response missing text output (may contain only thought parts).");
  }
  let svgText = textOutput.trim();
  const svgMatch = svgText.match(/<svg[\s\S]*<\/svg>/i);
  if (svgMatch) {
    svgText = svgMatch[0];
  }
  return {
    mode: "live",
    svgText,
    provider: "nanabanana2"
    // Keep the frontend provider name same for compatibility
  };
}
__name(tryGeminiVectorize, "tryGeminiVectorize");
__name2(tryGeminiVectorize, "tryGeminiVectorize");
async function vectorizeInput({ provider, imageBase64, imageUrl, mimeType, options }) {
  if (provider === "mock") {
    return {
      mode: "mock",
      svgText: MOCK_VECTOR_SVG,
      provider: "mock"
    };
  }
  if (provider !== "nanabanana2") {
    throw new ApiFailure(400, "INVALID_REQUEST", "Only nanabanana2 provider is supported in v1.");
  }
  if (!imageBase64 && !imageUrl) {
    throw new ApiFailure(400, "INVALID_REQUEST", "Either imageBase64 or imageUrl is required.");
  }
  return tryGeminiVectorize({ imageBase64, imageUrl, mimeType, options });
}
__name(vectorizeInput, "vectorizeInput");
__name2(vectorizeInput, "vectorizeInput");
function buildExportSvg({ analysis, includeLayers = ["logo", "guides", "annotations"], styleConfig = {} }) {
  const { input, bestSolution } = analysis;
  const { bbox } = input;
  const layers = [];
  const swL = bbox.width * 5e-3;
  const swG = bbox.width * 2e-3;
  const fwA = bbox.width * 0.03;
  const padX = bbox.width * 0.2;
  const padY = bbox.height * 0.2;
  let originalContent = "";
  let svgRootAttrs = "";
  if (input.raw) {
    const svgTagMatch = input.raw.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/i);
    if (svgTagMatch) {
      originalContent = svgTagMatch[2];
      const attrs = svgTagMatch[1];
      const inheritParts = [];
      for (const name of ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "opacity"]) {
        const m = attrs.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
        if (m) inheritParts.push(`${name}="${m[1]}"`);
      }
      svgRootAttrs = inheritParts.join(" ");
    }
  }
  if (includeLayers.includes("logo")) {
    layers.push(`<g id="logo-layer" opacity="0.6" ${svgRootAttrs}>${originalContent}</g>`);
  }
  if (includeLayers.includes("guides")) {
    const opts = styleConfig || {};
    const lineColorStr = opts.lineColor || "#ff6d00";
    const circleColorStr = opts.circleColor || "#0057ff";
    const lineWeightMult = typeof opts.lineWeightMult === "number" ? opts.lineWeightMult : 2;
    const circleWeightMult = typeof opts.circleWeightMult === "number" ? opts.circleWeightMult : 2;
    const circles = bestSolution.circles.map((circle) => `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="${circleColorStr}" stroke-width="${swG * circleWeightMult}" stroke-dasharray="${swG * circleWeightMult * 3} ${swG * circleWeightMult * 2}" data-role="${circle.role}"/>`).join("\n");
    const lines = bestSolution.lines.map((line) => `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="${lineColorStr}" stroke-width="${swG * lineWeightMult}" stroke-dasharray="${swG * lineWeightMult * 2} ${swG * lineWeightMult * 2}" data-role="${line.role}"/>`).join("\n");
    layers.push(`<g id="guides-layer">${circles}${lines}</g>`);
  }
  if (includeLayers.includes("annotations")) {
    layers.push(`<g id="annotations-layer"><text x="${bbox.minX}" y="${bbox.maxY + fwA * 1.5}" fill="#111" font-family="monospace" font-size="${fwA}">${solverSignature}</text><text x="${bbox.minX}" y="${bbox.maxY + fwA * 3}" fill="#111" font-family="monospace" font-size="${fwA}">score=${bestSolution.metrics.finalScore}</text></g>`);
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.minX - padX} ${bbox.minY - padY} ${bbox.width + padX * 2} ${bbox.height + padY * 2 + fwA * 4}" data-analysis-id="${analysis.analysisId}">
  ${layers.join("\n")}
</svg>
`.trim();
}
__name(buildExportSvg, "buildExportSvg");
__name2(buildExportSvg, "buildExportSvg");
function pdfEscape(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
__name(pdfEscape, "pdfEscape");
__name2(pdfEscape, "pdfEscape");
function buildExportPdf({ analysis, includeLayers = [], styleConfig = {} }) {
  const lines = [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj"
  ];
  const content = [
    "BT",
    "/F1 12 Tf",
    "72 740 Td",
    `(${pdfEscape("guidepack export")}) Tj`,
    "0 -18 Td",
    `(${pdfEscape(`analysisId=${analysis.analysisId}`)}) Tj`,
    "0 -18 Td",
    `(${pdfEscape("layer=guides")}) Tj`,
    "0 -18 Td",
    `(${pdfEscape(`score=${analysis.bestSolution.metrics.finalScore}`)}) Tj`,
    "0 -18 Td",
    `(${pdfEscape(solverSignature)}) Tj`,
    "ET"
  ].join("\n");
  lines.push(`4 0 obj << /Length ${content.length} >> stream
${content}
endstream endobj`);
  const xrefStart = lines.join("\n").length + 1;
  lines.push("xref");
  lines.push("0 5");
  lines.push("0000000000 65535 f ");
  lines.push("0000000010 00000 n ");
  lines.push("0000000060 00000 n ");
  lines.push("0000000117 00000 n ");
  lines.push("0000000248 00000 n ");
  lines.push(`trailer << /Root 1 0 R /Size 5 >>`);
  lines.push(`startxref
${xrefStart}`);
  lines.push("%%EOF");
  return Buffer.from(lines.join("\n"), "utf8");
}
__name(buildExportPdf, "buildExportPdf");
__name2(buildExportPdf, "buildExportPdf");
var app = new Hono2().basePath("/api");
app.get("/health", (c) => {
  return c.json({ ok: true, now: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/v1/vectorize", async (c) => {
  try {
    const body = await c.req.json();
    if (c.env?.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = c.env.GEMINI_API_KEY;
    }
    if (c.env?.GEMINI_MODEL) {
      process.env.GEMINI_MODEL = c.env.GEMINI_MODEL;
    }
    const { provider, imageBase64, imageUrl, mimeType, options } = body;
    const result = await vectorizeInput({
      provider,
      imageBase64,
      imageUrl,
      mimeType,
      options
    });
    return c.json({
      status: "done",
      svgText: result.svgText,
      provider: result.provider,
      providerMode: result.mode
    });
  } catch (error) {
    const status = error.status || error.statusCode || 500;
    return c.json({
      errorCode: error.errorCode || "VECTORIZATION_FAILED",
      errorMessage: error.errorMessage || error.message
    }, status);
  }
});
app.post("/v1/logo/analyze", async (c) => {
  try {
    const body = await c.req.json();
    const analysis = analyzeLogo({
      svgText: body.svgText,
      strategy: body.strategy ?? "auto",
      constraints: body.constraints ?? {}
    });
    return c.json({
      analysisId: analysis.analysisId,
      input: analysis.input,
      constraintGraph: analysis.constraintGraph,
      strategy: analysis.strategy,
      bestSolution: analysis.bestSolution,
      candidates: analysis.candidates,
      metrics: analysis.metrics,
      signature: analysis.signature,
      createdAt: analysis.createdAt
    });
  } catch (error) {
    return c.json({
      errorCode: "ANALYSIS_FAILED",
      errorMessage: error.message
    }, 400);
  }
});
app.post("/v1/logo/export", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.svgText || !body.format) {
      return c.json({
        errorCode: "INVALID_REQUEST",
        errorMessage: "svgText and format are required for stateless export."
      }, 400);
    }
    const analysis = analyzeLogo({
      svgText: body.svgText,
      strategy: body.strategy ?? "auto",
      constraints: body.constraints ?? {}
    });
    const includeLayers = Array.isArray(body.includeLayers) ? body.includeLayers : ["logo", "guides", "annotations"];
    if (body.format === "svg") {
      const svgText = buildExportSvg({ analysis, includeLayers, styleConfig: body.styleConfig });
      const svgBase64 = typeof Buffer !== "undefined" ? Buffer.from(svgText, "utf8").toString("base64") : btoa(unescape(encodeURIComponent(svgText)));
      return c.json({
        mimeType: "image/svg+xml",
        fileName: `guidepack-${analysis.analysisId}.svg`,
        fileBase64: svgBase64
      });
    }
    if (body.format === "pdf") {
      const pdfBuffer = buildExportPdf({ analysis, includeLayers, styleConfig: body.styleConfig });
      const pdfBase64 = typeof Buffer !== "undefined" ? pdfBuffer.toString("base64") : btoa(String.fromCharCode.apply(null, new Uint8Array(pdfBuffer)));
      return c.json({
        mimeType: "application/pdf",
        fileName: `guidepack-${analysis.analysisId}.pdf`,
        fileBase64: pdfBase64
      });
    }
    return c.json({
      errorCode: "INVALID_REQUEST",
      errorMessage: "format must be svg or pdf."
    }, 400);
  } catch (error) {
    return c.json({
      errorCode: "EXPORT_FAILED",
      errorMessage: error.message
    }, 400);
  }
});
var onRequest = handle(app);
var routes = [
  {
    routePath: "/api/:route*",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match2(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match2, "match2");
__name2(match2, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-3HsTL4/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-3HsTL4/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.42011320823289156.js.map
