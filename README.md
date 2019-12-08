# galpi-server

## Setup

AWS and serverless login required. For environment variables, Copy `.env.example` to `.env.development` and `.env.production`.

-   `STAGE`: Development stage (`dev` | `prod`)
-   `AWS_SERVERLESS_REGION`: The region of AWS Secrets Manager
-   `AWS_SECRET_MANAGER_NAME_FIREBASE`: Secret name for Firebase service account

## Development

```sh
mysql.server start
npm install -g serverless
sls offline
```
