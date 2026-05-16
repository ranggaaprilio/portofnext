# Beautiful Grammar Tool

A powerful AI-powered grammar correction and text enhancement tool that uses OpenAI's GPT-3.5-turbo to improve your writing.

## Features

### 🔧 Core Functionality
- **Grammar Correction**: Fix spelling, grammar, and punctuation errors
- **Professional Tone**: Transform casual text into professional language
- **Formal Writing**: Convert informal text to formal structure
- **Clarity Enhancement**: Improve readability and flow
- **Concise Writing**: Make text more concise while preserving meaning

### 🛡️ Security & Privacy
- **Local Storage**: API keys are stored locally in your browser
- **No Data Sharing**: Your text and API key are never shared with third parties
- **Direct API Calls**: Communicates directly with OpenAI, no intermediary servers

### 📊 Text Analysis
- **Character Count**: Track original and enhanced text length
- **Change Statistics**: See how much your text has been modified
- **Real-time Feedback**: Instant validation and error handling

## How to Use

### 1. Setup OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Enter your API key in the configuration section
3. The key is automatically saved in your browser's local storage

### 2. Enter Your Text
1. Type or paste your text in the "Input Text" area
2. Text is limited to 2000 characters per request
3. The character counter will help you track usage

### 3. Choose Enhancement Options
Select the types of improvements you want:
- **Fix Grammar**: Correct spelling, grammar, and punctuation
- **Make Professional**: Enhance tone for business communication
- **Make Formal**: Convert to formal language structure
- **Improve Clarity**: Enhance readability and flow
- **Make Concise**: Reduce wordiness while preserving meaning

### 4. Enhance Your Text
1. Click "Enhance Text" to process your content
2. Wait for AI processing (usually 2-10 seconds)
3. Review the enhanced text in the output section

### 5. Use Enhanced Text
- **Copy**: Copy the enhanced text to clipboard
- **Use as Input**: Move enhanced text back to input for further refinement
- **Compare**: View statistics showing the changes made

## API Usage & Costs

### Token Estimation
- Approximately 4 characters = 1 token
- Cost estimation is shown before processing
- Typical cost: $0.001-0.005 per enhancement

### OpenAI Model
- Uses **GPT-3.5-turbo** for optimal balance of quality and cost
- Temperature set to 0.3 for consistent corrections
- Maximum 2000 tokens output to control costs

## Examples

### Grammar Correction
**Input:**
```
This are a sentence with bad grammer and some mispelled words.
```

**Output:**
```
This is a sentence with proper grammar and correctly spelled words.
```

### Professional Enhancement
**Input:**
```
Hey, can you check this out and let me know what you think?
```

**Output:**
```
Could you please review this document and provide your feedback?
```

### Formal Writing
**Input:**
```
I think we should probably consider maybe changing this approach.
```

**Output:**
```
I recommend that we consider revising this approach.
```

## Technical Details

### Service Functions
- `buildEnhancementPrompt()`: Creates optimized prompts for OpenAI
- `correctGrammarWithOpenAI()`: Handles API communication
- `calculateTextChanges()`: Analyzes differences between texts
- `getTextStatistics()`: Provides comprehensive text analysis
- `validateApiKey()`: Ensures API key format is correct

### Error Handling
- Invalid API key detection
- Rate limit management
- Quota exceeded warnings
- Network error recovery
- Empty response handling

### Browser Compatibility
- Modern browsers with ES6+ support
- Local storage for API key persistence
- Responsive design for mobile devices

## Troubleshooting

### Common Issues

**"Invalid API key" Error**
- Verify your API key starts with "sk-"
- Check for extra spaces or characters
- Ensure the key is from OpenAI Platform

**"Rate limit exceeded" Error**
- Wait a few moments before trying again
- OpenAI has usage limits per minute/hour

**"API quota exceeded" Error**
- Check your OpenAI account billing
- Add payment method if using free tier

**Empty Response**
- Try shorter text input
- Check your internet connection
- Verify API key has proper permissions

### Best Practices

1. **Text Length**: Keep input under 1500 characters for best results
2. **Enhancement Options**: Start with fewer options, add more as needed
3. **Multiple Passes**: Use "Use as Input" for iterative improvements
4. **API Key Security**: Never share your API key with others

## Development

### Testing
```bash
npm run test:unit -- beautiful-grammer
```

### E2E Testing
```bash
npm run test:e2e -- beautiful-grammer
```

### Local Development
```bash
npm run dev
```

Visit `http://localhost:5173/beautiful-grammer` to test the tool.

## Contributing

When contributing to this tool:

1. Follow the existing code patterns
2. Add tests for new functionality
3. Update documentation for new features
4. Ensure responsive design works on all devices
5. Test with various text inputs and edge cases

## License

This tool is part of the IT-Tools project and follows the same licensing terms.