<p align="center">
  <a href="https://github.com/EnAccess/OpenPAYGO-js">
    <img
      src="https://enaccess.org/wp-content/uploads/2024/02/OpenPAYGO-Graphics-GitHub-2240-×-800.svg"
      alt="OpenPAYGO"
      width="640"
    >
  </a>
</p>
<p align="center">
    <em>OpenPAYGO is an Open Source ecosystem to enable pay-as-you-go functionality in new devices and products.</em>
</p>
<p align="center">
  <img
    alt="Project Status"
    src="https://img.shields.io/badge/Project%20Status-beta-orange"
  >
  <img
    alt="GitHub Workflow Status"
    src="https://img.shields.io/github/actions/workflow/status/EnAccess/OpenPAYGO-js/.github/workflows/check.yaml"
  >
  <a href="https://github.com/EnAccess/OpenPAYGO-js/blob/main/LICENSE" target="_blank">
    <img
      alt="License"
      src="https://img.shields.io/github/license/EnAccess/openpaygo-python"
    >
  </a>
</p>

---

# OpenPAYGO - JavaScript library

This repository contains the **JavaScript** implementions of different OpenPAYGO technologies to run on your server or device.

Server-side tasks include

- generating OpenPAYGO tokens
- decoding OpenPAYGO metrics payloads

Device side tasks

- decoding OpenPAYGO tokens
- generating OpenPAYGO metrics payloads

## Installation

Install via NPM (browser/nodejs)

```bash
npm i openpaygo
```

## Usage

Generate normal or extended tokens

```javascript
// initialize token encoder
const encoder = new require("openpaygo").Encoder()

// generate normal or extended token using generateToken function
const { finalToken, newCount } = encoder.generateToken({
  tokenType: 1,
  secretKeyHex: "bc41ec9530f6dac86b1a29ab82edc5fb",
  count: 3,
  startingCode: 516959010,
  restrictDigitSet: false,
  value: 1,
  extendToken: false,
})

console.log("generated token ", finalToken)
console.log("next token count ", newCount)
```

Decode tokens using token decoder

```javascript
// initialize token decoder
const decoder = new require("openpaygo").Decoder()

// decord token (type, value, count, updated_counts) using decodeToken function
const { value, tokenType, count, updatedCounts } = decoder.decodeToken({
  token: "380589011",
  secretKeyHex: "bc41ec9530f6dac86b1a29ab82edc5fb",
  count: 3,
  usedCounts: [],
  startingCode: 516959010,
  restrictedDigitSet: false,
})

console.log(value) // decoded token value
console.log(count) // decoded token count
console.log(tokenType) // decoded token type
console.log(updatedCounts) // decoder token update count
```


## Documentation

OpenPAYGO documentation is hosted on [https://enaccess.github.io/OpenPAYGO-docs/](https://enaccess.github.io/OpenPAYGO-docs/).

## OpenPAYGO ecosystem feature availabilties

The OpenPAYGO ecosystem offers a range of feautres to implement pay-as-you-go services.
These features are implemented in different programming language libraries individually.
Not all libraries have implemented the full range of features yet.

The **OpenPAYGO JavaScript library** supports the following features:

| Feature           | Status               |
| ----------------- | -------------------- |
| OpenPAYGO Token   | ✅ (stable)          |
| OpenPAYGO Metrics | ❌ (not implemented) |

## Support

- [OSEA Discord](https://discord.osea-community.org/) (`#openpaygo` channel)
- [EnAccess](https://enaccess.org/)
