oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @theniledev/events-example
$ nile COMMAND
running command...
$ nile (--version)
@theniledev/events-example/0.14.2 linux-x64 node-v16.16.0
$ nile --help [COMMAND]
USAGE
  $ nile COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nile reconcile`](#nile-reconcile)

## `nile reconcile`

reconcile nile/pulumi deploys

```
USAGE
  $ nile reconcile [--json] [--basePath <value>] [--workspace <value>] [--email <value>] [--password <value>]
    [--organization <value>] [--entity <value>] [-s] [--region <value>]

FLAGS
  -s, --status            check current status of your control and data planes
  --basePath=<value>      [default: http://localhost:8080] root URL for the Nile API
  --email=<value>         [default: developer@demo.com] developer email address
  --entity=<value>        an entity type in your Nile workspace
  --organization=<value>  an organization in your Nile workspace
  --password=<value>      [default: very_secret] developer password
  --region=<value>        [default: us-west-2] AWS region
  --workspace=<value>     [default: dev] your Nile workspace name

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  reconcile nile/pulumi deploys
```
<!-- commandsstop -->
