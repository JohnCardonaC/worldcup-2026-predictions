#!/usr/bin/env bash
# Despliegue del backend del juego (DynamoDB + Lambda Function URL) — idempotente.
# Uso:  ./deploy.sh <aws-profile> [region]
# Free tier permanente: DynamoDB provisioned 5/5 RCU-WCU, Lambda 1M req/mes.
set -euo pipefail

PROFILE="${1:?Uso: ./deploy.sh <aws-profile> [region]}"
REGION="${2:-us-east-1}"
TABLE="wc2026-players"
FN="wc2026-api"
ROLE="wc2026-api-role"
AWS="aws --profile $PROFILE --region $REGION"

cd "$(dirname "$0")"
ACCOUNT=$($AWS sts get-caller-identity --query Account --output text)
echo "Cuenta: $ACCOUNT · Región: $REGION"

# 1. Tabla DynamoDB (provisioned 5/5 = siempre gratis)
if ! $AWS dynamodb describe-table --table-name "$TABLE" >/dev/null 2>&1; then
  echo "Creando tabla $TABLE…"
  $AWS dynamodb create-table --table-name "$TABLE" \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 >/dev/null
  $AWS dynamodb wait table-exists --table-name "$TABLE"
else
  echo "Tabla $TABLE ya existe ✓"
fi

# 2. Rol IAM
if ! $AWS iam get-role --role-name "$ROLE" >/dev/null 2>&1; then
  echo "Creando rol $ROLE…"
  $AWS iam create-role --role-name "$ROLE" --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null
  $AWS iam put-role-policy --role-name "$ROLE" --policy-name wc2026-dynamo --policy-document "{
    \"Version\":\"2012-10-17\",
    \"Statement\":[
      {\"Effect\":\"Allow\",\"Action\":[\"dynamodb:GetItem\",\"dynamodb:PutItem\",\"dynamodb:Scan\"],\"Resource\":\"arn:aws:dynamodb:$REGION:$ACCOUNT:table/$TABLE\"},
      {\"Effect\":\"Allow\",\"Action\":[\"logs:CreateLogGroup\",\"logs:CreateLogStream\",\"logs:PutLogEvents\"],\"Resource\":\"*\"}
    ]}" >/dev/null
  echo "Esperando propagación del rol (10s)…"; sleep 10
else
  echo "Rol $ROLE ya existe ✓"
fi

# 3. Lambda
rm -f lambda.zip && (cd lambda && zip -q ../lambda.zip index.mjs)
if ! $AWS lambda get-function --function-name "$FN" >/dev/null 2>&1; then
  echo "Creando Lambda $FN…"
  $AWS lambda create-function --function-name "$FN" \
    --runtime nodejs20.x --handler index.handler --architectures arm64 \
    --role "arn:aws:iam::$ACCOUNT:role/$ROLE" \
    --zip-file fileb://lambda.zip \
    --environment "Variables={TABLE_NAME=$TABLE}" \
    --timeout 10 --memory-size 128 >/dev/null
else
  echo "Actualizando código de $FN…"
  $AWS lambda update-function-code --function-name "$FN" --zip-file fileb://lambda.zip >/dev/null
fi
$AWS lambda wait function-active-v2 --function-name "$FN"

# 4. Function URL pública con CORS
if ! $AWS lambda get-function-url-config --function-name "$FN" >/dev/null 2>&1; then
  echo "Creando Function URL…"
  $AWS lambda create-function-url-config --function-name "$FN" --auth-type NONE \
    --cors 'AllowOrigins=*,AllowMethods=GET,PUT,AllowHeaders=content-type,MaxAge=86400' >/dev/null
  $AWS lambda add-permission --function-name "$FN" --statement-id public-url \
    --action lambda:InvokeFunctionUrl --principal '*' --function-url-auth-type NONE >/dev/null
fi

URL=$($AWS lambda get-function-url-config --function-name "$FN" --query FunctionUrl --output text)
echo ""
echo "================================================================"
echo "✅ Backend listo. URL del API (pégasela a Claude):"
echo "$URL"
echo "================================================================"
echo "Prueba rápida:  curl ${URL}ranking"
