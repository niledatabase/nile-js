# nile-js

This repo contains javascript for interacting with a nile backend service.

## Installation

```bash
yarn add @theniledev/react @theniledev/js
```

## Packages

Three main packages make up the core of the repository: a main js client, a react wrapper around the client, and examples using a variety of react + client libraries to accomplish certain tasks.

## [@theniledev/js](./lib/nile/README.md)

API client (based on `fetch`) for integrating a Nile API. This package is typed against the API, so it is best consumed using typescript. If you desire full control over API interactions (or are using express or the like for your integration), it is best to use the library directly. Basic usage [can be found here](./lib/nile/README.md), and full examples can be found [inside the source readme](./lib/nile/src/README.md).

## [@theniledev/react](./packages/react/README.md)

React wrapper around `@theniledev/js` client. It provides access to components abstracting the API, and hooks for interacting with the API.

## [@theniledev/examples](./packages/examples/README.md)

A next.js demo application implementing features from `@theniledev/react` and other experiments with `@theniledev/js`. Generally, this would be a sandbox for experimenting with the API.
