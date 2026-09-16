/**
 * Shared Configuration
 *
 * Centralized model configuration for all examples.
 * The model provider lives here; all AI SDK calls import from `ai`.
 */

import { ollama } from 'ai-sdk-ollama';

/**
 * The model to use for all examples.
 * Change this to use a different Ollama model.
 * 
 * Common options:
 * - 'granite4' - IBM Granite 4 (default, good for structured output)
 * - 'llama3.2' - Meta Llama 3.2
 * - 'qwen2.5' - Alibaba Qwen 2.5
 * - 'mistral' - Mistral AI
 * 
 * Make sure to run: ollama pull <model_name> first
 */
export const MODEL_NAME = process.env.OLLAMA_MODEL ?? 'granite4.1:3b';

/**
 * Pre-configured model instance for use across all examples.
 */
export const model = ollama(MODEL_NAME);
