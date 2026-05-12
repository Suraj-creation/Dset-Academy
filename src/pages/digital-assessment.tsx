import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';
import assessmentData from '../data/assessment.json';
import { CheckCircle, ChevronLeft, ChevronRight, BarChart2, Target, TrendingUp, Award } from 'lucide-react';

interface Answer {
  questionId: string;
  value: number;
  categoryId: string;
}

interface AssessmentResults {
  overallScore: number;
  categoryScores: { [key: string]: number };
  maturityLevel: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

const DigitalAssessmentPage = () => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [startTime] = useState(Date.now());

  // NEW: contact capture state
  const [showContactForm, setShowContactForm] = useState(true);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const currentCategory = assessmentData.categories[currentCategoryIndex];
  const currentQuestion = currentCategory.questions[currentQuestionIndex];
  const totalQuestions = assessmentData.categories.reduce((total, cat) => total + cat.questions.length, 0);
  const answeredQuestions = answers.length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (value: number) => {
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      value,
      categoryId: currentCategory.id
    };

    // Remove any existing answer for this question
    const filteredAnswers = answers.filter(a => a.questionId !== currentQuestion.id);
    setAnswers([...filteredAnswers, newAnswer]);

    // Auto advance to next question
    setTimeout(() => {
      if (currentQuestionIndex < currentCategory.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentCategoryIndex < assessmentData.categories.length - 1) {
        setCurrentCategoryIndex(currentCategoryIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        // Assessment completed
        submitAssessment([...filteredAnswers, newAnswer]);
      }
    }, 500);
  };

  const submitAssessment = async (finalAnswers: Answer[]) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/assessment-scoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: finalAnswers,
          categories: assessmentData.categories,
          metadata: {
            completionTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        const assessmentResults = await response.json();
        setResults(assessmentResults);
        setIsCompleted(true);
      } else {
        console.error('Failed to score assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      setCurrentQuestionIndex(assessmentData.categories[currentCategoryIndex - 1].questions.length - 1);
    }
  };

  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion.id)?.value;
  };

  const getMaturityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'text-red-600';
      case 'developing': return 'text-orange-600';
      case 'proficient': return 'text-yellow-600';
      case 'advanced': return 'text-blue-600';
      case 'expert': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isCompleted && results) {
    return (
      <Layout>
        <Section bgColor="light" spacing="xl">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-[#ff851b]">
                Your Digital Maturity Assessment Results
              </h1>
              <p className="text-xl text-[#ff851b]">
                Comprehensive analysis of your organization's digital transformation readiness
              </p>
            </motion.div>

            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-[#001f3f] to-[#003366] rounded-2xl p-8 mb-8 text-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{Math.round(results.overallScore)}</div>
                  <div className="text-lg opacity-90">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getMaturityColor(results.maturityLevel)}`}>
                    {results.maturityLevel}
                  </div>
                  <div className="text-lg opacity-90">Maturity Level</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 text-[#ff851b]" />
                  <div className="text-lg opacity-90">Ready for Growth</div>
                </div>
              </div>
            </motion.div>

            {/* Category Scores */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-[#001f3f] flex items-center">
                <BarChart2 className="mr-3" />
                Category Breakdown
              </h2>
              <div className="space-y-6">
                {assessmentData.categories.map((category) => {
                  const score = results.categoryScores[category.id] || 0;
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-2xl font-bold text-[#001f3f] min-w-[60px] text-right">
                        {Math.round(score)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-green-50 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                  <CheckCircle className="mr-2" />
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-green-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-blue-50 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <Target className="mr-2" />
                  Improvement Areas
                </h3>
                <ul className="space-y-3">
                  {results.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <Target className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gradient-to-br from-[#5e17ea]/10 to-[#1e90ff]/10 rounded-2xl p-8 mt-8"
            >
              <h3 className="text-2xl font-bold text-[#001f3f] mb-6">
                Recommended Next Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-[#5e17ea] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center mt-12"
            >
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl shadow-lg text-lg hover:scale-105 transition-transform duration-300"
              >
                Get Personalized Consulting
                <ChevronRight className="ml-2" />
              </Link>
            </motion.div>
          </div>
        </Section>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <Section bgColor="light" spacing="xl">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin w-16 h-16 border-4 border-[#5e17ea] border-t-transparent rounded-full mx-auto mb-8"></div>
            <h2 className="text-2xl font-bold text-[#001f3f] mb-4">
              Analyzing Your Responses...
            </h2>
            <p className="text-gray-600">
              Our AI is evaluating your digital maturity and preparing personalized recommendations.
            </p>
          </div>
        </Section>
      </Layout>
    );
  }

  // NEW: mandatory contact step — block access to the assessment until lead captured
  if (showContactForm) {
    return (
      <Layout>
        <Section bgColor="light" spacing="xl">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#001f3f] mb-2">Quickly introduce yourself</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your contact details so we can follow up with a personalised review.</p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setContactError(null);

                  if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
                    setContactError('Name, email and phone are required.');
                    return;
                  }

                  setContactLoading(true);
                  try {
                    await fetch('/api/leads', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: contactName,
                        email: contactEmail,
                        phone: contactPhone,
                        source: 'digital-assessment',
                        timestamp: new Date().toISOString()
                      }),
                    });
                    // On success, allow assessment to render
                    setShowContactForm(false);
                  } catch (err) {
                    console.error('Failed to submit lead', err);
                    setContactError('Could not submit contact — try again.');
                  } finally {
                    setContactLoading(false);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    autoFocus
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name"
                    className="col-span-1 md:col-span-1 p-3 border rounded-lg placeholder-black text-black"
                    required
                  />
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    className="col-span-1 md:col-span-1 p-3 border rounded-lg placeholder-black text-black"
                    required
                  />
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Phone"
                    className="col-span-1 md:col-span-1 p-3 border rounded-lg placeholder-black text-black"
                    required
                  />
                </div>

                {contactError && <div className="text-sm text-red-600 mb-3">{contactError}</div>}

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white rounded-lg font-semibold shadow"
                  >
                    {contactLoading ? 'Saving...' : 'Start Assessment'}
                    <ChevronRight className="ml-2" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section bgColor="light" spacing="xl">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-[#ff851b]">
              Digital Maturity Assessment
            </h1>
            <p className="text-xl text-gray-300">
              {assessmentData.assessmentMetadata.description}
            </p>
            
            {/* Progress Bar */}
            <div className="bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Question {answeredQuestions + 1} of {totalQuestions}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCategoryIndex}-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              {/* Category Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-[#5e17ea]/10 text-[#5e17ea] rounded-full text-sm font-medium mb-6">
                {currentCategory.name} ({currentQuestionIndex + 1}/{currentCategory.questions.length})
              </div>

              {/* Question */}
              <h2 className="text-2xl font-bold text-[#001f3f] mb-8">
                {currentQuestion.question}
              </h2>

              {/* Answer Options */}
              <div className="space-y-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = getCurrentAnswer() === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-[#5e17ea] bg-[#5e17ea]/10 shadow-md'
                          : 'border-gray-200 hover:border-[#5e17ea]/50 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isSelected ? 'text-[#5e17ea]' : 'text-gray-900'}`}>
                          {option.text}
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-[#5e17ea] bg-[#5e17ea]' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 text-gray-300 hover:text-[#5e17ea] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <ChevronLeft className="mr-2" />
              Previous
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-300">Current Category</div>
              <div className="font-semibold text-[#ff851b]">{currentCategory.name}</div>
            </div>

            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default DigitalAssessmentPage;