# node-html-reporter

Zero-configuration reporter for node native testing.  `npx ntc` is essentially equivalent to the following bash script:

```bash
#!/bin/bash
rm -rf "${NODE_V8_COVERAGE:-./coverage}"
mkdir "${NODE_V8_COVERAGE:-./coverage}"
NODE_V8_COVERAGE="${NODE_V8_COVERAGE:-./coverage}" node --experimental-test-coverage \
  --test-reporter spec --test-reporter-destination stdout \
  --test-reporter @fordi-org/node-html-reporter --test-reporter-destination stdout \
  --test "${@}"
```

It will create a coverage HTML document in `./coverage/index.html`, which you can use to analyze the efficacy of your test suite.

## Setup

`package.json`

```json
{
  "scripts": {
    "test": "node --test",
    "coverage": "ntc",
  }
}
```
