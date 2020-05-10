"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = azureFunctionHandler;

var _awsServerlessExpress = _interopRequireDefault(require("aws-serverless-express"));

var _url = _interopRequireDefault(require("url"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function azureFunctionHandler(app, binaryTypes) {
  binaryTypes = binaryTypes || ['*/*'];

  var server = _awsServerlessExpress.default.createServer(app, undefined, binaryTypes);

  return function (context, req) {
    var path = _url.default.parse(req.originalUrl).pathname;

    try {
      req.headers['x-ms-privatelink-id'] = 'fake-id';
    } catch (error) {
      console.log('do nothing');
    }

    var event = {
      path: path,
      httpMethod: req.method,
      headers: req.headers || {},
      queryStringParameters: req.query || {},
      body: req.rawBody,
      isBase64Encoded: false
    };
    var awsContext = {
      succeed: function succeed(awsResponse) {
        context.res.status = awsResponse.statusCode;
        context.res.headers = _objectSpread({}, context.res.headers, awsResponse.headers);
        context.res.body = Buffer.from(awsResponse.body, awsResponse.isBase64Encoded ? 'base64' : 'utf8');
        context.res.isRaw = true;
        context.done();
      }
    };

    _awsServerlessExpress.default.proxy(server, event, awsContext);
  };
}

module.exports = exports.default;