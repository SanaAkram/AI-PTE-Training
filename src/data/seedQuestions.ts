import type { Section, TaskType } from "@/lib/types";

export interface SeedQuestion {
  section: Section;
  task_type: TaskType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  payload: Record<string, unknown>;
}

// Starter bank: 2 items per task type (an easy one and a harder one), covering
// all 22 real PTE task types. This proves every interaction end-to-end and
// gives Mubeen his first days of varied practice; scripts/daily-grow.ts is
// what grows this toward the 30,000-question scale gradually, as discussed.
export const SEED_QUESTIONS: SeedQuestion[] = [
  // ---------------------------------------------------------------- Speaking
  {
    section: "speaking",
    task_type: "read_aloud",
    difficulty: 1,
    payload: { text: "The weather is quite pleasant today." },
  },
  {
    section: "speaking",
    task_type: "read_aloud",
    difficulty: 3,
    payload: {
      text: "Although the project faced several delays, the team completed it within the revised deadline.",
    },
  },
  {
    section: "speaking",
    task_type: "repeat_sentence",
    difficulty: 1,
    payload: { audioText: "I usually start my work early." },
  },
  {
    section: "speaking",
    task_type: "repeat_sentence",
    difficulty: 3,
    payload: { audioText: "Effective time management can significantly improve daily productivity." },
  },
  {
    section: "speaking",
    task_type: "describe_image",
    difficulty: 1,
    payload: {
      imageType: "bar",
      imageTitle: "Weekly Study Hours",
      imageData: { Mon: 2, Tue: 3, Wed: 1, Thu: 4, Fri: 2 },
      keyPoints: [
        "Thursday has the highest study hours",
        "Wednesday has the lowest",
        "Overall the hours vary through the week",
      ],
    },
  },
  {
    section: "speaking",
    task_type: "describe_image",
    difficulty: 3,
    payload: {
      imageType: "line",
      imageTitle: "Online Course Enrollments (2019–2023)",
      imageData: { "2019": 20, "2020": 45, "2021": 60, "2022": 55, "2023": 80 },
      keyPoints: [
        "Enrollments rose sharply in 2020",
        "There was a small dip in 2022",
        "Overall the trend is strongly upward",
      ],
    },
  },
  {
    section: "speaking",
    task_type: "retell_lecture",
    difficulty: 1,
    payload: {
      audioText:
        "Reading every day helps you learn new words and understand English better. Even ten minutes a day can make a big difference over time.",
      keyPoints: [
        "Daily reading builds vocabulary",
        "Even short reading sessions help",
        "Consistency matters more than length",
      ],
    },
  },
  {
    section: "speaking",
    task_type: "retell_lecture",
    difficulty: 3,
    payload: {
      audioText:
        "Renewable energy sources such as solar and wind are becoming more affordable every year. Many countries are now investing heavily in these technologies to reduce their dependence on fossil fuels and lower carbon emissions.",
      keyPoints: [
        "Solar and wind costs are falling",
        "Countries are investing more in renewables",
        "The goal is reducing fossil fuel dependence and emissions",
      ],
    },
  },
  {
    section: "speaking",
    task_type: "answer_short_question",
    difficulty: 1,
    payload: { audioText: "What do we call the first meal of the day?", answer: "breakfast" },
  },
  {
    section: "speaking",
    task_type: "answer_short_question",
    difficulty: 3,
    payload: {
      audioText: "What is the term for words that have the same meaning?",
      answer: "synonyms",
    },
  },
  {
    section: "speaking",
    task_type: "respond_to_situation",
    difficulty: 1,
    payload: {
      situationText: "Your friend looks worried before an exam. What would you say to encourage them?",
      sampleResponse: "Don't worry, you've prepared well. Just stay calm and do your best.",
    },
  },
  {
    section: "speaking",
    task_type: "respond_to_situation",
    difficulty: 3,
    payload: {
      situationText:
        "A colleague submitted a report with your name missing from the credits by mistake. How would you politely raise this with them?",
      sampleResponse:
        "I noticed my name wasn't included in the report credits — could we fix that? I think it was probably just an oversight.",
    },
  },
  {
    section: "speaking",
    task_type: "summarize_group_discussion",
    difficulty: 1,
    payload: {
      lines: [
        { speaker: "Ali", text: "I think online classes are more convenient." },
        { speaker: "Sara", text: "But it's harder to stay focused at home." },
        { speaker: "Bilal", text: "Maybe a mix of both would work best." },
      ],
      keyPoints:
        "The group discussed whether online or in-person classes are better, weighing convenience against focus, and agreed a mix of both could work well.",
    },
  },
  {
    section: "speaking",
    task_type: "summarize_group_discussion",
    difficulty: 3,
    payload: {
      lines: [
        { speaker: "Dr. Khan", text: "Remote work has increased productivity for many employees." },
        { speaker: "Fatima", text: "However, it can also lead to isolation and burnout." },
        { speaker: "Omar", text: "Companies need clear policies to balance flexibility with employee wellbeing." },
      ],
      keyPoints:
        "The discussion covered remote work's productivity benefits, its risk of isolation and burnout, and the need for company policies balancing flexibility with wellbeing.",
    },
  },

  // ----------------------------------------------------------------- Writing
  {
    section: "writing",
    task_type: "summarize_written_text",
    difficulty: 1,
    payload: {
      passage:
        "Drinking enough water every day is important for health. It helps the body regulate temperature, keeps joints lubricated, and helps deliver nutrients to cells. Doctors generally recommend drinking about eight glasses of water a day, although the exact amount can vary depending on activity level and climate.",
    },
  },
  {
    section: "writing",
    task_type: "summarize_written_text",
    difficulty: 3,
    payload: {
      passage:
        "Artificial intelligence is increasingly being used in healthcare to assist doctors with diagnosis and treatment planning. Machine learning models can analyze medical images faster than the human eye and often catch patterns that are easy to miss. However, experts caution that AI should support, not replace, human judgment, since errors in training data can lead to biased or incorrect predictions. Ongoing regulation and testing are considered essential as adoption grows.",
    },
  },
  {
    section: "writing",
    task_type: "essay_writing",
    difficulty: 1,
    payload: {
      prompt:
        "Some people prefer to work in a team, while others prefer to work alone. Discuss both views and give your own opinion.",
    },
  },
  {
    section: "writing",
    task_type: "essay_writing",
    difficulty: 3,
    payload: {
      prompt:
        "Many countries are investing more in renewable energy while others continue to rely on fossil fuels. Discuss the advantages and disadvantages of this shift and give your own opinion.",
    },
  },

  // ----------------------------------------------------------------- Reading
  {
    section: "reading",
    task_type: "reading_mcq_single",
    difficulty: 1,
    payload: {
      passage:
        "Many people prefer online shopping because it saves time and offers more choices. However, some still enjoy visiting physical stores for the experience of seeing and touching products before buying.",
      question: "Why do some people still prefer physical stores?",
      options: [
        "They enjoy seeing and touching products before buying",
        "They save more time",
        "They have more payment options",
        "They get better internet deals",
      ],
      correctIndex: 0,
    },
  },
  {
    section: "reading",
    task_type: "reading_mcq_single",
    difficulty: 3,
    payload: {
      passage:
        "Urban green spaces, such as parks and community gardens, have been shown to improve residents' mental health and reduce stress levels. City planners are increasingly incorporating green spaces into new developments, even though land in cities is expensive and space is limited.",
      question: "According to the passage, why is it notable that city planners are adding more green spaces?",
      options: [
        "Green spaces are free to build",
        "City land is expensive and space is limited, yet planners still prioritize green spaces",
        "Residents demanded more parking instead",
        "Green spaces reduce construction costs",
      ],
      correctIndex: 1,
    },
  },
  {
    section: "reading",
    task_type: "reading_mcq_multiple",
    difficulty: 1,
    payload: {
      passage:
        "Regular exercise offers several benefits: it strengthens the heart, improves mood, helps maintain a healthy weight, and can improve sleep quality.",
      question: "Which benefits of exercise are mentioned in the passage?",
      options: ["Strengthens the heart", "Improves mood", "Increases screen time", "Improves sleep quality"],
      correctIndices: [0, 1, 3],
    },
  },
  {
    section: "reading",
    task_type: "reading_mcq_multiple",
    difficulty: 3,
    payload: {
      passage:
        "The study found that employees who worked flexible hours reported higher job satisfaction and better work-life balance. However, it also noted that flexible schedules could make team coordination more difficult and sometimes blurred the boundary between work and personal time.",
      question: "Which downsides of flexible hours does the study mention?",
      options: ["Lower job satisfaction", "Harder team coordination", "Blurred work-life boundary", "Reduced pay"],
      correctIndices: [1, 2],
    },
  },
  {
    section: "reading",
    task_type: "reorder_paragraphs",
    difficulty: 1,
    payload: {
      paragraphsInOrder: [
        "Many students find it hard to manage their time during exam season.",
        "One helpful strategy is to create a study schedule in advance.",
        "This schedule should include short breaks to avoid burnout.",
        "By planning ahead, students can reduce stress and improve their results.",
      ],
    },
  },
  {
    section: "reading",
    task_type: "reorder_paragraphs",
    difficulty: 3,
    payload: {
      paragraphsInOrder: [
        "Cities around the world are facing growing challenges related to traffic congestion.",
        "As populations increase, more vehicles compete for limited road space.",
        "In response, many cities have begun investing in public transportation and cycling infrastructure.",
        "Early results suggest that these investments can meaningfully reduce congestion over time.",
      ],
    },
  },
  {
    section: "reading",
    task_type: "reading_fill_blanks_drag",
    difficulty: 1,
    payload: {
      textWithBlanks:
        "Learning a new language takes {{1}} and practice. It is important to {{2}} a little every day rather than studying for long hours occasionally.",
      wordBank: ["time", "practice", "study", "rarely"],
      answers: ["time", "study"],
    },
  },
  {
    section: "reading",
    task_type: "reading_fill_blanks_drag",
    difficulty: 3,
    payload: {
      textWithBlanks:
        "The report {{1}} that customer satisfaction has {{2}} significantly since the new policy was introduced, although a few departments still {{3}} improvement.",
      wordBank: ["indicates", "improved", "require", "decreased", "ignore"],
      answers: ["indicates", "improved", "require"],
    },
  },
  {
    section: "reading",
    task_type: "reading_writing_fill_blanks_dropdown",
    difficulty: 1,
    payload: {
      textWithBlanks: "She {{1}} to the market every Sunday to buy fresh vegetables.",
      blanks: [{ options: ["go", "goes", "going", "gone"], correctIndex: 1 }],
    },
  },
  {
    section: "reading",
    task_type: "reading_writing_fill_blanks_dropdown",
    difficulty: 3,
    payload: {
      textWithBlanks:
        "By the time the manager {{1}} the meeting, most of the important decisions had already been {{2}}.",
      blanks: [
        { options: ["reach", "reaches", "reached", "reaching"], correctIndex: 2 },
        { options: ["make", "making", "made", "makes"], correctIndex: 2 },
      ],
    },
  },

  // --------------------------------------------------------------- Listening
  {
    section: "listening",
    task_type: "summarize_spoken_text",
    difficulty: 1,
    payload: {
      audioText:
        "Many workplaces are now offering employees the choice to work from home a few days a week. Supporters say this improves work-life balance and reduces commuting time, while critics argue it can weaken team collaboration and company culture.",
    },
  },
  {
    section: "listening",
    task_type: "summarize_spoken_text",
    difficulty: 3,
    payload: {
      audioText:
        "A recent study examined how sleep affects memory and learning in university students. Researchers found that students who slept at least seven hours before an exam performed noticeably better on memory-based tasks than those who slept less than five hours. The study suggests that adequate sleep may be as important as study time itself when preparing for exams.",
    },
  },
  {
    section: "listening",
    task_type: "listening_mcq_single",
    difficulty: 1,
    payload: {
      audioText:
        "The library will be closed this Friday for maintenance, but it will reopen as usual on Saturday morning.",
      question: "When will the library reopen?",
      options: ["Friday afternoon", "Saturday morning", "Sunday", "It stays closed"],
      correctIndex: 1,
    },
  },
  {
    section: "listening",
    task_type: "listening_mcq_single",
    difficulty: 3,
    payload: {
      audioText:
        "Although the committee initially supported the new proposal, several members changed their position after reviewing the updated budget figures, and the vote was ultimately postponed.",
      question: "What happened to the vote?",
      options: ["It passed easily", "It was rejected", "It was postponed", "It was cancelled permanently"],
      correctIndex: 2,
    },
  },
  {
    section: "listening",
    task_type: "listening_mcq_multiple",
    difficulty: 1,
    payload: {
      audioText:
        "To stay healthy, doctors recommend eating more vegetables, drinking enough water, sleeping at least seven hours, and avoiding too much sugar.",
      question: "Which health recommendations are mentioned?",
      options: ["Eat more vegetables", "Sleep at least seven hours", "Exercise twice a day", "Avoid too much sugar"],
      correctIndices: [0, 1, 3],
    },
  },
  {
    section: "listening",
    task_type: "listening_mcq_multiple",
    difficulty: 3,
    payload: {
      audioText:
        "The survey revealed that most participants valued flexible working hours and remote work options, though fewer were satisfied with current communication tools and career growth opportunities.",
      question: "Which areas were participants dissatisfied with?",
      options: ["Flexible working hours", "Communication tools", "Remote work options", "Career growth opportunities"],
      correctIndices: [1, 3],
    },
  },
  {
    section: "listening",
    task_type: "listening_fill_blanks",
    difficulty: 1,
    payload: {
      audioText: "The train to the city center departs every fifteen minutes during rush hour.",
      textWithBlanks: "The train to the city center departs every {{1}} minutes during {{2}} hour.",
      answers: ["fifteen", "rush"],
    },
  },
  {
    section: "listening",
    task_type: "listening_fill_blanks",
    difficulty: 3,
    payload: {
      audioText:
        "Researchers observed a gradual decline in average temperatures across the region despite global warming trends elsewhere.",
      textWithBlanks:
        "Researchers observed a {{1}} decline in average temperatures across the region despite global {{2}} trends elsewhere.",
      answers: ["gradual", "warming"],
    },
  },
  {
    section: "listening",
    task_type: "highlight_correct_summary",
    difficulty: 1,
    payload: {
      audioText:
        "Public transportation usage has increased in the past year, largely due to rising fuel prices and new bus routes connecting suburban areas to the city center.",
      summaries: [
        "Public transportation use rose due to higher fuel prices and new suburban bus routes.",
        "Fuel prices fell, causing fewer people to use public transportation.",
        "New bus routes were cancelled because of low demand.",
        "The city center removed all public transportation options.",
      ],
      correctIndex: 0,
    },
  },
  {
    section: "listening",
    task_type: "highlight_correct_summary",
    difficulty: 3,
    payload: {
      audioText:
        "While the new curriculum aims to improve critical thinking skills, teachers report that limited training and larger class sizes are making it difficult to implement the changes effectively.",
      summaries: [
        "Teachers fully support the new curriculum with no concerns.",
        "The new curriculum aims to improve critical thinking, but limited teacher training and large class sizes hinder effective implementation.",
        "The curriculum was cancelled due to teacher opposition.",
        "Class sizes have been reduced to support the new curriculum.",
      ],
      correctIndex: 1,
    },
  },
  {
    section: "listening",
    task_type: "select_missing_word",
    difficulty: 1,
    payload: {
      audioTextBeforeGap: "If you want to improve your English, you should practice every",
      options: ["day", "book", "car", "color"],
      correctIndex: 0,
    },
  },
  {
    section: "listening",
    task_type: "select_missing_word",
    difficulty: 3,
    payload: {
      audioTextBeforeGap:
        "Despite the setbacks, the research team remained confident that their findings would eventually be",
      options: ["published", "forgotten", "ignored", "cancelled"],
      correctIndex: 0,
    },
  },
  {
    section: "listening",
    task_type: "highlight_incorrect_words",
    difficulty: 1,
    payload: {
      audioText: "The museum opens at nine in the morning and closes at five in the evening.",
      transcriptWithErrors: "The museum opens at ten in the morning and closes at five in the afternoon.",
      incorrectWordIndices: [4, 14],
    },
  },
  {
    section: "listening",
    task_type: "highlight_incorrect_words",
    difficulty: 3,
    payload: {
      audioText:
        "The committee will announce its final decision after reviewing all the submitted proposals next week.",
      transcriptWithErrors:
        "The committee will announce its first decision after ignoring all the submitted proposals next month.",
      incorrectWordIndices: [5, 8, 14],
    },
  },
  {
    section: "listening",
    task_type: "write_from_dictation",
    difficulty: 1,
    payload: { audioText: "She works at a hospital." },
  },
  {
    section: "listening",
    task_type: "write_from_dictation",
    difficulty: 3,
    payload: { audioText: "The report was submitted before the deadline." },
  },
];
