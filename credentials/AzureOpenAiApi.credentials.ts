import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AzureOpenAiApi implements ICredentialType {
	name = 'azureOpenAiApi';
	displayName = 'Azure OpenAI API';
	documentationUrl = 'https://learn.microsoft.com/en-us/azure/ai-services/openai/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Found under Keys in the Azure OpenAI resource page.',
		},
		{
			displayName: 'Endpoint',
			name: 'endpoint',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://your-resource.openai.azure.com',
			description: 'Do NOT include trailing slash or /openai in the URL.',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string',
			default: '2025-01-01-preview',
			description: 'Must match version in Azure Portal (e.g., 2024-12-01-preview)',
			required: true,
		},
		{
			displayName: 'Deployment Name',
			name: 'deployment',
			type: 'string',
			default: '',
			required: true,
			description: 'Deployment name from your Azure model deployment (e.g., gpt-4o-mini)',
		},
	];

	// Performance optimization: Use routing-optimized authentication
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'api-key': '={{ $credentials.apiKey }}',
				'Content-Type': 'application/json',
			},
		},
	};

	// Performance optimization: Streamlined credential test
	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: '={{ $credentials.endpoint + "/openai/deployments/" + $credentials.deployment + "/chat/completions?api-version=" + $credentials.apiVersion }}',
			body: {
				messages: [
					{ role: 'system', content: 'Test' },
					{ role: 'user', content: 'Hi' },
				],
				max_tokens: 1,
				temperature: 0,
			},
		},
	};
}
