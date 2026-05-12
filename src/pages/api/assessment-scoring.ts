import type { NextApiRequest, NextApiResponse } from 'next';

interface Answer {
  questionId: string;
  value: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  weight: number;
  questions: any[];
}

interface AssessmentRequest {
  answers: Answer[];
  categories: Category[];
  metadata: {
    completionTime: number;
    timestamp: string;
  };
}

interface AssessmentResults {
  overallScore: number;
  categoryScores: { [key: string]: number };
  maturityLevel: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AssessmentResults | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { answers, categories, metadata }: AssessmentRequest = req.body;

    // Calculate category scores
    const categoryScores: { [key: string]: number } = {};
    let weightedSum = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      const categoryAnswers = answers.filter(a => a.categoryId === category.id);
      const categorySum = categoryAnswers.reduce((sum, answer) => sum + answer.value, 0);
      const maxPossibleScore = category.questions.length * 5; // Maximum score per question is 5
      const categoryScore = (categorySum / maxPossibleScore) * 100;
      
      categoryScores[category.id] = categoryScore;
      weightedSum += categoryScore * (category.weight / 100);
      totalWeight += category.weight;
    });

    const overallScore = (weightedSum / totalWeight) * 100;

    // Determine maturity level
    let maturityLevel = '';
    if (overallScore < 20) maturityLevel = 'Beginner';
    else if (overallScore < 40) maturityLevel = 'Developing';
    else if (overallScore < 60) maturityLevel = 'Proficient';
    else if (overallScore < 80) maturityLevel = 'Advanced';
    else maturityLevel = 'Expert';

    // Prepare data for GPT-4o analysis
    const analysisPrompt = `
    You are a digital transformation expert analyzing a comprehensive digital maturity assessment for an MSME (Micro, Small & Medium Enterprise). 

    Assessment Results:
    - Overall Score: ${overallScore.toFixed(1)}%
    - Maturity Level: ${maturityLevel}
    
    Category Breakdown:
    ${categories.map(cat => 
      `- ${cat.name}: ${categoryScores[cat.id].toFixed(1)}% (Weight: ${cat.weight}%)`
    ).join('\n    ')}

    Detailed Responses:
    ${answers.map(answer => {
      const category = categories.find(c => c.id === answer.categoryId);
      const question = category?.questions.find(q => q.id === answer.questionId);
      return `- ${question?.question}: Score ${answer.value}/5`;
    }).join('\n    ')}

    Based on this comprehensive assessment, provide:

    1. **Strengths** (3-4 key areas where the organization excels)
    2. **Improvement Areas** (3-4 critical areas needing attention)
    3. **Specific Recommendations** (6-8 actionable next steps prioritized by impact and feasibility for an MSME)

    Focus on practical, cost-effective recommendations suitable for small-medium businesses. Consider budget constraints, resource limitations, and the need for quick wins alongside strategic initiatives.

    IMPORTANT: Respond with ONLY valid JSON in this exact structure (no markdown formatting, no explanations):
    {
      "strengths": ["strength1", "strength2", "strength3", "strength4"],
      "improvements": ["improvement1", "improvement2", "improvement3", "improvement4"],
      "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5", "rec6", "rec7", "rec8"]
    }

    Make each point concise but specific, avoiding generic advice. Tailor recommendations to the specific scores and patterns observed.
    `;

    // Call Azure OpenAI GPT-4o (you'll need to configure your Azure endpoint)
    const openaiResponse = await fetch(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_API_KEY || '',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert digital transformation consultant specializing in MSME digital maturity assessments. Provide practical, actionable insights.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.9,
        }),
      }
    );

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    let aiAnalysisContent = openaiData.choices[0].message.content;
    
    // Clean up the response - remove markdown formatting if present
    aiAnalysisContent = aiAnalysisContent.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiAnalysisContent);
      
      // Validate the structure
      if (!aiAnalysis.strengths || !aiAnalysis.improvements || !aiAnalysis.recommendations) {
        throw new Error('Invalid AI response structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiAnalysisContent);
      throw new Error('Invalid AI response format');
    }

    const results: AssessmentResults = {
      overallScore,
      categoryScores,
      maturityLevel,
      recommendations: aiAnalysis.recommendations,
      strengths: aiAnalysis.strengths,
      improvements: aiAnalysis.improvements,
    };

    res.status(200).json(results);

  } catch (error) {
    console.error('Assessment scoring error:', error);
    
    // Fallback analysis if AI fails
    const { answers, categories } = req.body;
    
    const categoryScores: { [key: string]: number } = {};
    let weightedSum = 0;
    let totalWeight = 0;

    categories.forEach((category: Category) => {
      const categoryAnswers = answers.filter((a: Answer) => a.categoryId === category.id);
      const categorySum = categoryAnswers.reduce((sum: number, answer: Answer) => sum + answer.value, 0);
      const maxPossibleScore = category.questions.length * 5;
      const categoryScore = (categorySum / maxPossibleScore) * 100;
      
      categoryScores[category.id] = categoryScore;
      weightedSum += categoryScore * (category.weight / 100);
      totalWeight += category.weight;
    });

    const overallScore = (weightedSum / totalWeight) * 100;
    
    let maturityLevel = '';
    if (overallScore < 20) maturityLevel = 'Beginner';
    else if (overallScore < 40) maturityLevel = 'Developing';
    else if (overallScore < 60) maturityLevel = 'Proficient';
    else if (overallScore < 80) maturityLevel = 'Advanced';
    else maturityLevel = 'Expert';

    // Fallback recommendations
    const fallbackResults: AssessmentResults = {
      overallScore,
      categoryScores,
      maturityLevel,
      recommendations: [
        "Develop a comprehensive digital transformation strategy aligned with business goals",
        "Invest in cloud infrastructure to improve scalability and flexibility",
        "Implement data analytics tools to enable data-driven decision making",
        "Digitize core business processes to improve efficiency",
        "Enhance cybersecurity measures to protect digital assets",
        "Provide digital skills training for employees",
        "Establish customer digital touchpoints to improve experience",
        "Create a culture of innovation and continuous improvement"
      ],
      strengths: [
        "Leadership commitment to digital transformation",
        "Basic digital infrastructure in place",
        "Willingness to adopt new technologies",
        "Customer-focused approach"
      ],
      improvements: [
        "Strategic planning and roadmap development",
        "Technology infrastructure modernization", 
        "Data management and analytics capabilities",
        "Employee digital skills development"
      ]
    };

    res.status(200).json(fallbackResults);
  }
}