import {
  ServiceUnavailableException,
  UnprocessableEntityException
} from '@nestjs/common';
import {
  anonymize,
  isOpenAiResponse,
  OPENAI_MAX_OUTPUT_TOKENS,
  OPENAI_RESPONSES_URL,
  OPENAI_TIMEOUT_MS
} from '@offerly/helpers';
import { JsonSchema } from '../preparation.types';

export interface StructuredOutputRequest {
  apiKey: string;
  model: string;
  instructions: string;
  input: string;
  schemaName: string;
  schema: JsonSchema;
  label: string;
}

export async function requestStructuredOutput(
  request: StructuredOutputRequest
): Promise<unknown> {
  const { label } = request;
  const title = label.charAt(0).toUpperCase() + label.slice(1);
  if (!request.apiKey || !request.model)
    throw new ServiceUnavailableException(`${title} AI is not configured`);
  let response: Response;
  try {
    response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${request.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model,
        store: false,
        max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
        instructions: request.instructions,
        input: anonymize(request.input).text,
        text: {
          format: {
            type: 'json_schema',
            name: request.schemaName,
            strict: true,
            schema: request.schema
          }
        }
      })
    });
  } catch {
    throw new ServiceUnavailableException(`${title} AI unavailable`);
  }
  if (!response.ok)
    throw new ServiceUnavailableException(`${title} AI rejected request`);
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new UnprocessableEntityException(`Unreadable ${label} response`);
  }
  if (!isOpenAiResponse(payload))
    throw new UnprocessableEntityException(`Invalid ${label} response`);
  const output = payload.output
    ?.flatMap((item) => item.content ?? [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text ?? '')
    .join('');
  try {
    return JSON.parse(output ?? '');
  } catch {
    throw new UnprocessableEntityException(`Invalid ${label} result`);
  }
}
