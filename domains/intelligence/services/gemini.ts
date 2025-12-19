/**
 * GeneratedIntelligence Domain - Gemini API Client
 * 
 * Pure AI generation functions - stateless capabilities.
 * No UI, Workspace, or storage dependencies.
 * 
 * This file contains the low-level Gemini API calls.
 * For higher-level orchestration, see orchestrator.ts.
 */

import { GoogleGenAI, Type } from "@google/genai";
import type { JobInfo } from '../../jobs/types';
import type { 
  AnalysisResult, 
  ResearchResult, 
  ToneType, 
  LinkedInMessageInput, 
  InterviewQuestion 
} from '../types';
import { extractWebSources } from '../../../src/types/gemini';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

// 1. Extract Text from Resume (PDF)
export const extractResumeText = async (fileBase64: string, mimeType: string = 'application/pdf'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: "Extract all the text content from this resume document. Organize it clearly by sections (Experience, Education, Skills, etc.). Do not summarize, just extract."
          }
        ]
      }
    });
    return response.text || "";
  } catch (err: unknown) {
    console.error("Error parsing resume:", err);
    throw new Error("Failed to extract text from resume.");
  }
};

// 2. Company Research
export const researchCompany = async (companyName: string, companyUrl?: string): Promise<ResearchResult> => {
  try {
    const prompt = `Research the company "${companyName}"${companyUrl ? ` (${companyUrl})` : ''}.
    Focus on:
    1. Mission and values.
    2. Recent news (last 6 months).
    3. Company culture.
    4. Key products/services.
    
    Provide a comprehensive summary useful for a job applicant.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    // Extract grounding metadata for sources (type-safe)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = extractWebSources(Array.isArray(groundingChunks) ? groundingChunks : []);

    // Remove duplicates
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      summary: response.text || "No research data available.",
      sources: uniqueSources
    };
  } catch (err: unknown) {
    console.error("Error researching company:", err);
    return { summary: "Could not complete company research due to an error.", sources: [] };
  }
};

// 3. Analyze Resume against Job Description
export const analyzeResume = async (
    resumeText: string, 
    jobInfo: JobInfo, 
    userLinks?: { portfolio?: string, linkedin?: string }
): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze this resume against the job description.
        
        JOB DESCRIPTION:
        Title: ${jobInfo.title}
        Company: ${jobInfo.company}
        Description: ${jobInfo.description}
        
        RESUME:
        ${resumeText}

        CANDIDATE LINKS:
        Portfolio: ${userLinks?.portfolio || "N/A"}
        LinkedIn: ${userLinks?.linkedin || "N/A"}
        
        Return a JSON object with:
        - score (number 0-100)
        - missingKeywords (array of strings)
        - recommendations (array of strings, specific actionable advice. If the candidate has a portfolio/linkedin link, check if it's relevant to include or highlight)
        - atsCompatibility (string, brief assessment)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            atsCompatibility: { type: Type.STRING },
          },
          required: ["score", "missingKeywords", "recommendations", "atsCompatibility"],
        },
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty analysis response");
    
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (err: unknown) {
    console.error("Error analyzing resume:", err);
    return {
      score: 0,
      missingKeywords: [],
      recommendations: ["Failed to analyze resume."],
      atsCompatibility: "Unknown"
    };
  }
};

// 4. Generate Cover Letter
export const generateCoverLetter = async (
  resumeText: string,
  jobInfo: JobInfo,
  research: ResearchResult,
  tone: ToneType,
  userLinks?: { portfolio?: string, linkedin?: string }
): Promise<string> => {
  try {
    const prompt = `
      You are an expert career coach and professional writer specializing in creating compelling cover letters that get candidates interviews. Your task is to craft a cover letter that makes hiring managers think "I need to meet this person."

      JOB INFORMATION:
      Title: ${jobInfo.title}
      Company: ${jobInfo.company}
      Job Description: ${jobInfo.description}

      COMPANY RESEARCH & INSIGHTS:
      ${research.summary}

      CANDIDATE PROFILE (Extracted from Resume):
      ${resumeText}

      CANDIDATE EXTERNAL LINKS:
      Portfolio: ${userLinks?.portfolio || "N/A"}
      LinkedIn: ${userLinks?.linkedin || "N/A"}

      STRATEGIC REQUIREMENTS:
      1. OPENING HOOK (Critical - 2-3 sentences):
         - Start with a specific, authentic connection to the company
         - Reference recent news, product launch, mission, or company challenge
         - Make it impossible to be used for any other company
         - Immediately state the position and create intrigue

      2. VALUE PROPOSITION (Body paragraph 1):
         - Lead with the most impressive, relevant achievement
         - Use specific metrics and outcomes (e.g., "increased revenue by 40%", "led team of 12")
         - Directly connect this achievement to a key job requirement
         - Show you understand their challenge and have solved it before

      3. PROOF OF FIT (Body paragraph 2):
         - Highlight 2-3 additional relevant experiences
         - Match your skills to their specific tech stack/requirements
         - Demonstrate cultural alignment with company values
         - If a portfolio URL is provided (${userLinks?.portfolio || "N/A"}), mention it if relevant (e.g., "You can see examples of my work in my portfolio...").

      4. FORWARD-LOOKING CLOSE:
         - Express specific excitement about company's future/mission
         - Briefly mention what you'd bring to their upcoming projects/challenges
         - Include confident call to action
         - Professional but warm sign-off

      TONE CALIBRATION: ${tone}
      - If "Professional": Polished, accomplished, authoritative but approachable
      - If "Conversational": Confident, personable, energetic, authentic
      - If "Creative": Distinctive voice, memorable, slightly unconventional but professional
      - If "Bold": High confidence, direct, persuasive

      CRITICAL QUALITY STANDARDS:
      ✓ Every sentence must add unique value - no filler
      ✓ Use active voice and strong action verbs (led, built, launched, achieved)
      ✓ Include at least 3 specific metrics/numbers from resume
      ✓ Company name appears 2-3 times naturally
      ✓ Zero generic statements that could apply to any company
      ✓ Show personality while maintaining professionalism
      ✓ Demonstrate research without sounding like you googled them
      ✓ Balance confidence with humility
      ✓ Make it sound human, not AI-generated

      AVOID AT ALL COSTS:
      ✗ "I am writing to apply for..." (weak opening)
      ✗ "I am passionate about..." without proof
      ✗ Generic praise ("your innovative company")
      ✗ Repeating the job description back
      ✗ Clichés ("think outside the box", "hit the ground running")
      ✗ Self-deprecation or hesitant language ("I think", "I hope")
      ✗ Overly long paragraphs (max 4-5 sentences each)

      LENGTH: 300-400 words (recruiters spend 30 seconds scanning)

      OUTPUT FORMAT:
      Return only the cover letter text, professionally formatted with proper spacing between paragraphs. 
      Include a standard salutation (e.g., "Dear Hiring Team,") and a placeholder for signature (e.g., "Sincerely,\n[Your Name]").
      Do not include date or address blocks at the top.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Failed to generate cover letter.";
  } catch (err: unknown) {
    console.error("Error generating cover letter:", err);
    throw new Error("Failed to generate cover letter.");
  }
};

// 5. Generate LinkedIn First Message
export const generateLinkedInMessage = async (
  resumeText: string,
  jobInfo: JobInfo,
  input: LinkedInMessageInput,
  researchSummary: string
): Promise<string> => {
  try {
    const prompt = `
      You are a LinkedIn messaging strategist specializing in connecting with ${input.connectionStatus === 'new' ? 'new connections' : 'existing connections'}. 
      Your messages get 40%+ response rates by striking the perfect balance between professional and personable, interested but not desperate, informative but concise.

      CONTEXT: 
      ${input.connectionStatus === 'new' 
        ? 'The recruiter/person just accepted the user\'s connection request within the past 24-48 hours. This is the critical first real interaction.' 
        : 'The user is reaching out to an existing connection to reconnect, follow up, or start a new conversation about an opportunity.'}

      ---

      RECIPIENT INFORMATION:
      Name: ${input.recruiterName || "[Name]"}
      Title: ${input.recruiterTitle || "Recruiter/Manager"}
      Company: ${jobInfo.company}
      Recent Activity: ${input.recentActivity || "N/A"}

      CANDIDATE INFORMATION (From Resume):
      ${resumeText}

      JOB/INTENT CONTEXT:
      Target Role: ${jobInfo.title}
      Message Intent: ${input.messageIntent}
      Connection Context: ${input.connectionContext}
      Mutual Connection: ${input.mutualConnection || "N/A"}

      CUSTOM ADDITIONS:
      ${input.customAddition || "N/A"}

      COMPANY RESEARCH:
      ${researchSummary}

      ---

      YOUR MISSION:
      Create a message that makes the recipient think: "This person is professional, prepared, and worth talking to. I should respond."

      THE 4-PART STRUCTURE (150-200 words total):
      
      PART 1 - WARM OPENING (30-40 words):
      - ${input.connectionStatus === 'new' ? 'Thank them for connecting.' : 'Reconnect politely ("Hope you are doing well").'}
      - Reference why you reached out.
      - Weave in connection context.

      PART 2 - CREDIBILITY STATEMENT (40-50 words):
      - Mention current role/company.
      - ONE standout achievement with specific metric.
      - Link to their world.

      PART 3 - VALUE/INTEREST STATEMENT (40-50 words):
      - Specific interest in their company/role.
      - Reference something specific (news/research provided).
      - Show personalization.

      PART 4 - SOFT ASK + NEXT STEP (30-40 words):
      - Specific but easy question.
      - "Would you be open to..."
      - No big favors.

      TONE: ${input.tone}
      - Professional: Formal, complete sentences.
      - Warm Professional: Balanced, friendly but business-like.
      - Casual Confident: Conversational, shorter sentences.
      - Industry-Specific: Match the industry vibe.

      OUTPUT FORMAT:
      Return ONLY the message text, ready to send on LinkedIn.
      - No subject line
      - No signature block
      - Start with "Hi ${input.recruiterName || 'there'},"
      - Use line breaks between paragraphs.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Failed to generate LinkedIn message.";
  } catch (err: unknown) {
    console.error("Error generating LinkedIn message:", err);
    throw new Error("Failed to generate LinkedIn message.");
  }
};

// 6. Generate Interview Prep Questions
export const generateInterviewQuestions = async (
  resumeText: string,
  jobInfo: JobInfo,
  existingQuestions: string[] = []
): Promise<InterviewQuestion[]> => {
  try {
    const prompt = `
      You are an expert technical interviewer and executive coach. Your goal is to prepare a candidate for an interview by generating highly specific, high-signal questions based on their resume and the job description.

      JOB DESCRIPTION:
      Title: ${jobInfo.title}
      Company: ${jobInfo.company}
      Description: ${jobInfo.description}

      CANDIDATE RESUME:
      ${resumeText}

      EXISTING QUESTIONS (Do not repeat these):
      ${existingQuestions.join("; ")}

      TASK:
      Generate exactly 5 interview questions.
      - 3 Behavioral/Situational questions.
      - 2 Technical/Hard Skill questions.

      FOR EACH QUESTION PROVIDE:
      1. **Question**: The actual question.
      2. **Context**: Why is this likely to be asked?
      3. **Recommended Answer Structure**: The best framework to use (e.g., STAR, CAR, technical deep-dive structure).
      4. **Resume Leverage (Evidence)**: Explicit callouts to specific projects, metrics, or roles in the resume that should be used as evidence.
      5. **Answer Framing**: Suggested language, tone, or key themes to emphasize (e.g., "Focus on the scale of the migration").
      6. **Resume Gap / Evidence Gap**: If the resume lacks sufficient evidence for this question, explain clearly what is missing. If the resume is strong, set this to null.
      7. **Strategic Sample Answer**: Provide a concrete example of a strong answer.
         - If \`resumeGap\` is null (evidence exists): Draft the answer using the candidate's actual resume details to demonstrate how to weave their story. Set \`sampleAnswerType\` to 'resume-grounded'.
         - If \`resumeGap\` is NOT null (missing evidence): Draft a *hypothetical* ideal answer that a strong candidate *would* give to show the target quality. Set \`sampleAnswerType\` to 'hypothetical'.
         - Tone: Professional, concise, and executive-ready. Max 100 words.
         - Format: "Sure, in my role at [Company]..."
      8. **Cheat Code (Fabrication Risk)**: Identify a specific skill, metric, tool, or outcome that would be the "perfect" addition to this answer but is currently MISSING from their resume. Label this as a "Cheat Code" and include a disclaimer that this is a fabrication risk and requires preparation.

      OUTPUT JSON FORMAT:
      Return an array of objects.
      {
        "id": "unique_id",
        "question": "string",
        "type": "Behavioral" | "Technical" | "Situational",
        "context": "string",
        "answerStructure": "string",
        "resumeLeverage": "string",
        "answerFraming": "string",
        "resumeGap": "string | null",
        "sampleAnswer": "string",
        "sampleAnswerType": "resume-grounded" | "hypothetical",
        "cheatCode": "string | null"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["Behavioral", "Technical", "Situational"] },
              context: { type: Type.STRING },
              answerStructure: { type: Type.STRING },
              resumeLeverage: { type: Type.STRING },
              answerFraming: { type: Type.STRING },
              resumeGap: { type: Type.STRING, nullable: true },
              sampleAnswer: { type: Type.STRING },
              sampleAnswerType: { type: Type.STRING, enum: ["resume-grounded", "hypothetical"] },
              cheatCode: { type: Type.STRING, nullable: true },
            },
            required: ["id", "question", "type", "context", "answerStructure", "resumeLeverage", "answerFraming", "resumeGap", "sampleAnswer", "sampleAnswerType", "cheatCode"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty interview prep response");

    return JSON.parse(jsonText) as InterviewQuestion[];
  } catch (err: unknown) {
    console.error("Error generating interview questions:", err);
    throw new Error("Failed to generate interview questions.");
  }
};

// 7. Extract Job Details from URL
export const extractJobFromUrl = async (url: string): Promise<JobInfo> => {
    try {
        const prompt = `
        I need to extract job details from this specific job posting URL: ${url}
        
        Using Google Search to access the content of the page, extract the following:
        1. Job Title
        2. Company Name
        3. Full Job Description (copy as much relevant text as possible: responsibilities, requirements, qualifications).
        4. Company Website URL (if found).

        If the URL is a general site or the job details cannot be found, return empty strings for the fields.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using pro model for better complex extraction/reasoning with search
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        company: { type: Type.STRING },
                        description: { type: Type.STRING },
                        companyUrl: { type: Type.STRING },
                    },
                    required: ["title", "company", "description"],
                },
            }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("Empty extraction response");

        return JSON.parse(jsonText) as JobInfo;

    } catch (err: unknown) {
        console.error("Error extracting job from URL:", err);
        throw new Error("Could not automatically extract job details. Please paste them manually.");
    }
};

