# Usage

```json
{
  ...
  "scripts": {
    "test": "rm -rf \"${NODE_V8_COVERAGE:-./coverage}\"; mkdir \"${NODE_V8_COVERAGE:-./coverage}\"; NODE_V8_COVERAGE=\"${NODE_V8_COVERAGE:-./coverage}\" node --test-reporter @fordi/node-html-reporter --experimental-test-coverage --test"
  }
  ...
}
```
