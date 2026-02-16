import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('Warning: ANTHROPIC_API_KEY not set. Bill OCR will not work.');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
});

export interface BillExtraction {
  balance: number;
  minimum_due: number;
  due_date: string; // YYYY-MM-DD format
  description?: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function extractBillData(imageBase64: string): Promise<BillExtraction> {
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: `Analyze this bill/invoice image and extract the following information:
1. Total balance/amount owed (numeric value only, no currency symbols)
2. Minimum payment due (if shown, otherwise same as balance)
3. Due date (in YYYY-MM-DD format)
4. Brief description of what the bill is for (e.g., "Electric Bill", "Water Bill", "Credit Card")

Return ONLY a JSON object with this exact structure:
{
  "balance": <number>,
  "minimum_due": <number>,
  "due_date": "<YYYY-MM-DD>",
  "description": "<brief description>",
  "confidence": "high" | "medium" | "low"
}

If you cannot find clear information, use "low" confidence. If dates are ambiguous, make your best estimate.
If no minimum payment is shown, set minimum_due equal to balance.`,
          },
        ],
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Extract JSON from response (Claude might wrap it in markdown)
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }

  const result = JSON.parse(jsonMatch[0]);

  // Validate the response
  if (!result.balance || !result.due_date) {
    throw new Error('Missing required fields in extracted data');
  }

  return {
    balance: Number(result.balance),
    minimum_due: Number(result.minimum_due || result.balance),
    due_date: result.due_date,
    description: result.description || 'Bill',
    confidence: result.confidence || 'medium',
  };
}
