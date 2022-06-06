# Update OpenAPI interface
## 1st time set version to 4.3.1
```
npx @openapitools/openapi-generator-cli version-manager set 4.3.1
```
## Generate
```
$ npx @openapitools/openapi-generator-cli generate -g nodejs-express-server -i openapi/openapi.yaml -o src
```
or
```
$ npm run openapi
```
**Note: This should execute everytime if you modify the file `openapi/openapi.yaml`**
