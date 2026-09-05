export interface OpenAiContentItem {
  type?: string;
  text?: string;
}

export interface OpenAiOutputItem {
  type?: string;
  content?: OpenAiContentItem[];
}

export interface OpenAiResponse {
  output?: OpenAiOutputItem[];
}
