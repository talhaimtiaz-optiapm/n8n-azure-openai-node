// Imports remain the same
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class AzureOpenAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Azure OpenAI',
		name: 'azureOpenAi',
		icon: 'file:azureOpenAi.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Azure OpenAI services with optimized performance',
		defaults: {
			name: 'Azure OpenAI',
		},
		credentials: [
			{
				name: 'azureOpenAiApi',
				required: true,
			},
		],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		// Performance optimization: Use requestDefaults for base configuration
		requestDefaults: {
			ignoreHttpStatusErrors: true,
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Chat Completion', value: 'chatCompletion' },
				],
				default: 'chatCompletion',
				description: 'Select the type of Azure OpenAI resource to use',
			},
			{
				displayName: 'Deployment',
				name: 'deploymentSelection',
				type: 'options',
				options: [
					{ name: 'Use Credential Default', value: 'credential' },
					{ name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
					{ name: 'GPT-4o', value: 'gpt-4o' },
					{ name: 'Custom Deployment Name', value: 'custom' },
				],
				default: 'credential',
				description: 'Select the deployment to use or choose custom to enter a specific deployment name',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
					},
				},
			},
			{
				displayName: 'Custom Deployment Name',
				name: 'deploymentName',
				type: 'string',
				default: '',
				placeholder: 'Enter your deployment name',
				required: true,
				description: 'Enter your custom deployment name',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
						deploymentSelection: ['custom'],
					},
				},
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				default: {},
				placeholder: 'Add Message',
				options: [
					{
						name: 'messagesUi',
						displayName: 'Messages',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								options: [
									{ name: 'System', value: 'system' },
									{ name: 'User', value: 'user' },
									{ name: 'Assistant', value: 'assistant' },
								],
								default: 'user',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								default: '',
								description: 'The message content',
								typeOptions: { rows: 4, alwaysOpenEditWindow: true },
							},
						],
					},
				],
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
					},
				},
			},
			{
				displayName: 'Concurrent Requests',
				name: 'concurrentMode',
				type: 'options',
				options: [
					{ name: 'Custom (1-20)', value: 'custom' },
					{ name: 'High (10)', value: 'high' },
					{ name: 'Low (2)', value: 'low' },
					{ name: 'Medium (6)', value: 'medium' },
					{ name: 'Single (1)', value: 'single' },
				],
				default: 'single',
				description: 'Choose processing speed. Higher values are faster but may hit rate limits.',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
					},
				},
			},
			{
				displayName: 'Custom Concurrent Requests',
				name: 'concurrentRequests',
				type: 'number',
				default: 5,
				typeOptions: {
					minValue: 1,
					maxValue: 20,
				},
				description: 'Enter custom number of concurrent requests (1-20)',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
						concurrentMode: ['custom'],
					},
				},
			},
			{
				displayName: 'Enable Determinism',
				name: 'enableDeterminism',
				type: 'boolean',
				default: false,
				description: 'Whether to enable deterministic outputs using seed values. When enabled, the same inputs will produce consistent results.',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
					},
				},
			},
			{
				displayName: 'Seed Value',
				name: 'seedValue',
				type: 'number',
				default: 42,
				typeOptions: {
					minValue: -2147483648,
					maxValue: 2147483647,
				},
				description: 'Seed value for deterministic outputs. Use the same seed for consistent results across runs.',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
						enableDeterminism: [true],
					},
				},
			},
			{
				displayName: 'Simplify Output',
				name: 'simplifyOutput',
				type: 'boolean',
				default: true,
				description: 'Whether to return a simplified version of the response instead of the raw data',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
					},
				},
			},
			{
				displayName: 'Show Full Response',
				name: 'showFullResponse',
				type: 'boolean',
				default: false,
				description: 'Whether to include all Azure OpenAI metadata (usage, model, system_fingerprint, etc.) in the response. Useful for debugging and detailed analysis.',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
					},
				},
			},
			{
				displayName: 'Output Content as JSON',
				name: 'outputContentAsJson',
				type: 'boolean',
				default: false,
				description: 'Whether to attempt to parse the response content as JSON. Compatible with GPT-4 Turbo and GPT-3.5 Turbo models newer than gpt-3.5-turbo-1106.',
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Frequency Penalty',
						name: 'frequency_penalty',
						type: 'number',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description: 'How much to penalize new tokens based on their existing frequency',
					},
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						default: 1000,
						description: 'The maximum number of tokens to generate',
					},
					{
						displayName: 'Number of Completions',
						name: 'n',
						type: 'number',
						default: 1,
						description: 'How many completions to generate for each prompt',
					},
					{
						displayName: 'Presence Penalty',
						name: 'presence_penalty',
						type: 'number',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description: 'How much to penalize new tokens based on whether they appear in the text',
					},
					{
						displayName: 'Stop Sequences',
						name: 'stop',
						type: 'string',
						default: '',
						description: 'Up to 4 sequences where the API will stop generating further tokens (comma-separated)',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.7,
						typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
						description: 'Controls randomness: Lowering results in less random completions',
					},
					{
						displayName: 'Top P',
						name: 'top_p',
						type: 'number',
						default: 1,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
						description: 'Controls diversity via nucleus sampling',
					},
					{
						displayName: 'User ID',
						name: 'user',
						type: 'string',
						default: '',
						description: 'A unique identifier representing your end-user',
					},
				],
				displayOptions: {
					show: {
						resource: ['chatCompletion'],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('azureOpenAiApi');
				const endpoint = credentials.endpoint as string;
				const apiKey = credentials.apiKey as string;
				const apiVersion = credentials.apiVersion as string;

				try {
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `${endpoint}/openai/models?api-version=${apiVersion}`,
						headers: {
							'Content-Type': 'application/json',
							'api-key': apiKey,
						},
						json: true,
					});

					if (!response.data || !Array.isArray(response.data)) return [];

					return response.data.map((model: any) => ({
						name: model.id,
						value: model.id,
					})) as INodePropertyOptions[];
				} catch (error) {
					return [];
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials once
		const credentials = await this.getCredentials('azureOpenAiApi');
		const endpoint = credentials.endpoint as string;
		const apiKey = credentials.apiKey as string;
		const apiVersion = credentials.apiVersion as string;
		const deploymentFromCredentials = credentials.deployment as string;

		// Performance optimization: Process items in parallel batches with user-configurable concurrency
		const concurrentMode = this.getNodeParameter('concurrentMode', 0, 'single') as string;
		let batchSize: number;

		// Map concurrent mode to actual numbers
		switch (concurrentMode) {
			case 'single':
				batchSize = 1;
				break;
			case 'low':
				batchSize = 2;
				break;
			case 'medium':
				batchSize = 6;
				break;
			case 'high':
				batchSize = 10;
				break;
			case 'custom':
				batchSize = this.getNodeParameter('concurrentRequests', 0, 5) as number;
				break;
			default:
				batchSize = 1; // fallback to single
		}

		const batches: INodeExecutionData[][] = [];

		for (let i = 0; i < items.length; i += batchSize) {
			batches.push(items.slice(i, i + batchSize));
		}

		for (const batch of batches) {
			// Process batch in parallel
			const promises = batch.map(async (item, batchIndex) => {
				const itemIndex = batches.indexOf(batch) * batchSize + batchIndex;

				try {
					// Handle deployment selection
					const deploymentSelection = this.getNodeParameter('deploymentSelection', itemIndex, 'credential') as string;
					let deploymentName: string;

					switch (deploymentSelection) {
						case 'credential':
							deploymentName = deploymentFromCredentials;
							break;
						case 'gpt-4o-mini':
							deploymentName = 'gpt-4o-mini';
							break;
						case 'gpt-4o':
							deploymentName = 'gpt-4o';
							break;
						case 'custom':
							deploymentName = this.getNodeParameter('deploymentName', itemIndex, '') as string;
							break;
						default:
							deploymentName = deploymentFromCredentials; // fallback
					}
					const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as any;
					const simplifyOutput = this.getNodeParameter('simplifyOutput', itemIndex, true) as boolean;
					const showFullResponse = this.getNodeParameter('showFullResponse', itemIndex, false) as boolean;
					const outputContentAsJson = this.getNodeParameter('outputContentAsJson', itemIndex, false) as boolean;
					const enableDeterminism = this.getNodeParameter('enableDeterminism', itemIndex, false) as boolean;
					const seedValue = this.getNodeParameter('seedValue', itemIndex, 42) as number;

					let path = '';
					const requestBody: Record<string, any> = {};

					// Chat completion (only supported resource)
					const messagesData = this.getNodeParameter('messages', itemIndex) as {
						messagesUi: Array<{ role: string; content: string }>;
					};
					path = `/openai/deployments/${deploymentName}/chat/completions`;

					// Build request body in deterministic order for consistent results
					requestBody.messages = messagesData.messagesUi;

					// Handle determinism settings first
					if (enableDeterminism) {
						requestBody.seed = seedValue;
						// Force temperature=0 for true determinism if not explicitly set
						if (additionalFields.temperature === undefined) {
							requestBody.temperature = 0;
						}
					}

					// Handle additional fields in alphabetical order for consistency
					if (additionalFields.frequency_penalty !== undefined) requestBody.frequency_penalty = additionalFields.frequency_penalty;
					if (additionalFields.max_tokens) requestBody.max_tokens = additionalFields.max_tokens;
					if (additionalFields.n) requestBody.n = additionalFields.n;
					if (additionalFields.presence_penalty !== undefined) requestBody.presence_penalty = additionalFields.presence_penalty;
					if (additionalFields.stop) {
						requestBody.stop = additionalFields.stop.split(',').map((s: string) => s.trim()).filter(Boolean);
					}
					if (additionalFields.temperature !== undefined) requestBody.temperature = additionalFields.temperature;
					if (additionalFields.top_p !== undefined) requestBody.top_p = additionalFields.top_p;
					if (additionalFields.user) requestBody.user = additionalFields.user;

					const url = `${endpoint}${path}?api-version=${apiVersion}`;

					// Performance optimization: Use optimized HTTP request configuration
					const response = await this.helpers.httpRequest({
						method: 'POST',
						url,
						headers: {
							'Content-Type': 'application/json',
							'api-key': apiKey,
						},
						body: requestBody,
						json: true,
						timeout: 60000, // 60 second timeout
					});

					// Add debug info to response for troubleshooting
					const debugInfo = {
						seedUsed: enableDeterminism ? seedValue : 'not_used',
						temperature: requestBody.temperature !== undefined ? requestBody.temperature : 'default',
						determinismEnabled: enableDeterminism,
						// Debug: Show the raw values for troubleshooting
						_debug_additionalFields_temperature: additionalFields.temperature,
						_debug_requestBody_temperature: requestBody.temperature
					};

					// Performance optimization: Streamlined response processing
					let responseData;
					if (showFullResponse) {
						// Return full response with all Azure OpenAI metadata
						responseData = {
							...response,
							debug: debugInfo,
							_request_metadata: {
								deployment: deploymentName,
								api_version: apiVersion,
								endpoint: endpoint.replace(/\/$/, ''), // Remove trailing slash for cleaner output
								request_body: requestBody
							}
						};
					} else if (simplifyOutput) {
						// Return choice object filtered to match native OpenAI format (exclude Azure-specific fields)
						const choice = response.choices?.[0];
						if (choice) {
							responseData = {
								index: choice.index,
								message: choice.message,
								logprobs: choice.logprobs || null,
								finish_reason: choice.finish_reason,
								debug: debugInfo
							};
						} else {
							responseData = response;
						}
					} else {
						responseData = response;
						responseData.debug = debugInfo;
					}

					// Apply JSON parsing if enabled
					if (outputContentAsJson && responseData.message?.content) {
						const content = responseData.message.content;
						if (typeof content === 'string') {
							// Try to extract JSON from markdown code blocks first
							const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
							if (jsonMatch) {
								try {
									responseData.message.content = JSON.parse(jsonMatch[1]);
								} catch (error) {
									// Keep original content if parsing fails
								}
							} else {
								// Try to parse the entire content as JSON
								try {
									responseData.message.content = JSON.parse(content);
								} catch (error) {
									// Keep original content if parsing fails
								}
							}
						}
					}

					return {
						json: responseData,
						pairedItem: { item: itemIndex }
					};

				} catch (error: any) {
					// Performance optimization: Streamlined error handling
					const errorData = {
						error: error.message || 'Unknown error',
						status: error.response?.status || error.statusCode || 'unknown',
					};

					if (this.continueOnFail()) {
						return {
							json: errorData,
							pairedItem: { item: itemIndex }
						};
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Azure OpenAI Error: ${error.message}`,
							{
								itemIndex,
								description: `Status: ${errorData.status}. Check your credentials and deployment configuration.`,
							}
						);
					}
				}
			});

			// Wait for batch to complete and add to results
			const batchResults = await Promise.all(promises);
			returnData.push(...batchResults);
		}

		return [returnData];
	}
}
