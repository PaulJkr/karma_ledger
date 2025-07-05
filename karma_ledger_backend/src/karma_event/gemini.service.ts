// src/karma/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  HarmCategory,
  HarmBlockThreshold,
  //   GenerateContentResponse,
  CountTokensRequest,
  CountTokensResponse,
} from '@google/generative-ai';
import { handleError } from 'src/util/error';
import { KarmaEvent } from './models/karma_event.model';

interface KarmaActionJobData {
  userId: string;
  karmaEventId: string;
  action: string;
}

interface AiInsight {
  intensity: number;
  feedback: string;
  event_id: string;
  userId?: string;
  feedback_generated: boolean;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private generativeModel: GenerativeModel;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GOOGLE_API_KEY');
    this.modelName = this.configService.get<string>(
      'GEMINI_MODEL_NAME',
      'gemini-1.5-flash',
    );

    const genAI = new GoogleGenerativeAI(apiKey);

    this.generativeModel = genAI.getGenerativeModel({
      model: this.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
      },
    });

    this.logger.log(
      `Initialized Gemini model: ${this.modelName} for AI Service.`,
    );
  }

  private generateKarmaPrompt(data: KarmaActionJobData): string {
    return `
      You are an AI assistant for a "Karma Ledger" application. Your goal is to analyze a user's action and provide two pieces of information:
      1. An "intensityScore" on a numerical scale from -1 to +10.
         - +10: An extremely positive karma action (e.g., saving a life, major philanthropic act).
         - +7: A very positive action (e.g., organizing a charity event, helping a stranger in need).
         - +5: A moderately positive action (e.g., helping a friend, volunteering, resolving a conflict peacefully).
         - +2: A slightly positive action (e.g., complimenting someone, recycling, small acts of kindness).
         - 0: A neutral action (e.g., eating lunch, routine work, daily chores).
         - -1: A negative action (e.g., being rude, breaking a promise, minor dishonesty).
      2. A concise, encouraging, and personalized "feedbackMessage" to the user, reflecting on the action's impact and its intensity.
         - Keep the feedback positive, even for negative karma, focusing on learning or future improvement.
  
      Consider the following user action: "${data.action}"
  
      Your output MUST be a valid JSON object with the following structure:
      {
        "intensityScore": [integer between -1 and 10],
        "feedbackMessage": "[string, a concise and personalized feedback message]"
      }
      Do NOT include any other text or formatting outside the JSON object.
      `;
  }

  async processKarmaAction(data: KarmaActionJobData): Promise<AiInsight> {
    this.logger.log(
      `Calling Gemini for action ID: ${data.action}, description: "${data.action.substring(0, 50)}..."`,
    );

    const prompt = this.generateKarmaPrompt(data);

    try {
      const { totalTokens } = await this.countPromptTokens(prompt);
      this.logger.debug(
        `Prompt token count for action ${data.action}: ${totalTokens}`,
      );

      // Call the Gemini API to generate content
      const result = await this.generativeModel.generateContent(prompt);

      const response = result.response;

      // Handle potential content blocking by safety settings
      if (
        response.candidates &&
        response.candidates.length > 0 &&
        response.candidates[0].finishReason === 'SAFETY'
      ) {
        this.logger.warn(
          `Gemini blocked content due to safety settings for action ${data.karmaEventId}.`,
        );
        throw new Error('AI content blocked due to safety concerns.');
      }

      const jsonResponseText = response.text();

      if (!jsonResponseText) {
        throw new Error(
          'Gemini returned an empty response or no text content.',
        );
      }

      this.logger.debug(
        `Gemini Raw JSON Response for ${data.action}: ${jsonResponseText}`,
      );

      let parsedResponse: { intensityScore: number; feedbackMessage: string };
      try {
        parsedResponse = JSON.parse(jsonResponseText);
      } catch (jsonParseError) {
        this.logger.error(
          `Failed to parse Gemini JSON for action ${data.action}: "${jsonResponseText}"`,
          jsonParseError.stack,
        );
        throw new Error(
          'Gemini did not return valid JSON. Consider refining the prompt or checking model output.',
        );
      }

      if (
        typeof parsedResponse.intensityScore !== 'number' ||
        !Number.isInteger(parsedResponse.intensityScore) ||
        typeof parsedResponse.feedbackMessage !== 'string'
      ) {
        this.logger.error(
          `Invalid structure from Gemini for action ${data.action}: ${JSON.stringify(parsedResponse)}`,
        );
        throw new Error(
          'Gemini response missing expected fields or types (intensityScore as integer, feedbackMessage as string).',
        );
      }

      const intensityScore = Math.max(
        -10,
        Math.min(10, parsedResponse.intensityScore),
      );
      const intensity = Math.round(intensityScore);

      const feedback = parsedResponse.feedbackMessage.trim();

      this.logger.log(
        `AI result for action ${data.action}: Intensity ${intensityScore}, Feedback: "${feedback.substring(0, 80)}..."`,
      );

      return {
        event_id: data.karmaEventId,
        intensity,
        feedback,
        feedback_generated: true,
      };
    } catch (error) {
      this.logger.error(handleError(error));
      throw new Error(
        `AI processing failed for action ${data.action}: ${handleError(error)}`,
      );
    }
  }

  private async countPromptTokens(
    prompt: string,
  ): Promise<CountTokensResponse> {
    const request: CountTokensRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };
    const { totalTokens } = await this.generativeModel.countTokens(request);
    return { totalTokens };
  }

  async generateWeeklySuggestions(
    userId: string,
    events: KarmaEvent[],
  ): Promise<string[]> {
    this.logger.log(
      `Generating weekly suggestions for user ${userId} with events ${events.length}`,
    );

    if (!events || events.length === 0) {
      this.logger.warn(
        `No recent actions for user ${userId}, returning generic suggestions.`,
      );
      return [
        'Initiate a new community support activity.',
        'Mentor a peer who needs help.',
        'Reflect on one habit you can improve next week.',
      ];
    }

    const formattedActions = events
      .map(
        (event, idx) =>
          `(${idx + 1}) ${event.action} [intensity: ${event.intensity}]`,
      )
      .join('\n');

    const prompt = `
Act as a Karma Growth Coach for a Karma Ledger app user. Analyze these recent karma actions:
${formattedActions}

Generate 3 personalized suggestions for the coming week that will:
1. Challenge them beyond their current comfort zone
2. Align with but expand upon their demonstrated values/interests
3. Create meaningful social or personal impact

Requirements for each suggestion:
- Begin with an action verb
- Be specific and measurable
- Target different life domains (social, professional, personal growth)
- Include an implicit challenge to level up
- Avoid repeating previous action types
- Use an encouraging but direct tone

Response format: ONLY a JSON array of 3 strings, like:
[
  "Initiate a conversation with 3 strangers at your weekly meetup",
  "Dedicate 2 hours to volunteer work outside your usual causes",
  "Replace 30 minutes of social media with skill-building daily"
]

Focus on creating suggestions that feel both authentic to their journey and slightly uncomfortable to attempt.
`;

    try {
      const result = await this.generativeModel.generateContent(prompt);
      const responseText = result.response.text().trim();

      this.logger.debug(`Gemini raw weekly suggestion output: ${responseText}`);

      const suggestions = JSON.parse(responseText);
      if (!Array.isArray(suggestions)) {
        throw new Error(
          'Gemini did not return a valid JSON array of suggestions.',
        );
      }

      return suggestions.slice(0, 3); // limit to 3
    } catch (err) {
      this.logger.error(
        `Failed to generate weekly suggestions: ${handleError(err)}`,
      );
      return [
        'Volunteer for a cause you care about',
        'Help a friend with a task',
        'Give positive feedback to someone',
      ];
    }
  }
}
