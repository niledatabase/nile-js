# Nile Events Example #

This example demonstrates how to use a Nile agent to synchronize your data 
plane and control plane in real time with Nile events.

Nile doesn't prescribe any particular deployment solution, but here we'll be
using [Pulumi](https://app.pulumi.com/) to deploy objects into AWS.
## Prerequisites ##

This example assumes you have:

* [An AWS account](https://aws.amazon.com/free/)
* [A Pulumi account](https://app.pulumi.com/signup) that's 
  [connected to your AWS account](https://www.pulumi.com/docs/get-started/aws/begin/)
* [The Pulumi CLI installed]()
* A Nile developer account (see [Appendix](#appendix) for help)

## Configure Your Control Plane ##

1. [Login to the Nile Admin Dashboard](https://nad.thenile.dev/) If you don't 
  already have one, create a workspace named "cyberdyne".
2. Create an entity type named "SkyNet". An simple schema is sufficient for 
  this example:

```json
{
  "name": "SkyNet",
  "schema": {
    "type": "object",
    "properties": {
      "greeting": {
        "type": "string"
      }
    }
  }
}
```

3. Create an organization in your workspace named "sac-norad".
4. Create an SkyNet instance in your organization, with a simple greeting:

```json
{
  "greeting": "Come with me if you want to live."
}
```

## Configure Your Data Plane ##

| These instructions summarize how to [get started with Pulumi](https://www.pulumi.com/docs/get-started/aws/begin/)
| on AWS. See their docs for a more complete setup.

Install the Pulumi CLI and set up a new Pulumi project:

```bash
[~/] $ brew install pulumi/tap/pulumi
[~/] $ mkdir nile-examples && cd nile-examples
[~/] $ pulumi new aws-typescript
```

and accept the defaults:

```
project name: (nile-examples) 
project description: (A minimal AWS TypeScript Pulumi program) 
Created project 'nile-examples'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
stack name: (dev) 
Created stack 'dev'

aws:region: The AWS region to deploy into: (us-east-1)
Saved config
```

Run `pulumi up` to ensure that you've configured Pulumi correctly. This will
create a stack named `dev`. We won't be using this stack, but its presence
verifies that you're ready to proceed.

## Create and Execute a Nile Agent ##

In the `events-example` package root, run `yarn install && yarn build` to
create your custom Nile agent binaries.

To run the binary, you'll need to pass arguments for your Nile workspace,
organization, and entity type, plus your developer login. The workspace
and entity type are identified by name, but the organization requires an id.

| The organization id is not visible in the NAD yet, but can be obtained from
| the URL when you select an org. In this case:
|
| `https://nad.thenile.dev/cyberdyne/organization/org_02qfJTCBve6bw0XlxC92CG`
|
| the organization id is `org_02qfJTCBve6bw0XlxC92CG`.

Execute the binary with:

```bash
./bin/dev reconcile --basePath https://prod.thenile.dev \
--workspace cyberdyne \
--entity SkyNet \
--organization YOUR_ORG_ID \
--email YOUR_EMAIL \
--password YOUR_PASSWORD
```

This will synchronize your Pulumi stack and instantiate the SkyNet instance
already defined in your control plane. Check your Pulumi project dashboard to
confirm.

The agent will log out your instance properties, including the `websiteUrl` of
the object created by the [`pulumis3` program](./src/pulumi/pulumiS3.ts):

```bash
Outputs:

    bucketPolicy: {
        // ...redacted...
    }
    object      : {
        // ...redacted...
    }
    websiteUrl  : "s3-website-bucket-5c7d7bc.s3-website.us-east-2.amazonaws.com"

Resources:
    + 4 created

Duration: 5s
```
Pull up that `websiteUrl` in browser and you'll find your provided `greeting`
as well as all of your instance details.

## Add/Remove Instances ##

In your [Nile dashboard](https://nad.thenile.dev/dev/organizations), add one or
more SkyNet instances to your organization. This will trigger events that the 
agent receives, and will synchronize accordingly. Deleting an instance in your
control plane will result in destruction of the corresponding Pulumi stack.
