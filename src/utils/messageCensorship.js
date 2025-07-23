import { Filter } from "bad-words";
import leoProfanity from "leo-profanity";

// Initialize multiple censorship libraries for better coverage
const badWordsFilter = new Filter();
leoProfanity.loadDictionary();

// Add additional inappropriate words for comprehensive filtering
const additionalBadWords = [
  "nazi",
  "hitler",
  "terrorist",
  "suicide",
  "bomb",
  "kill",
  "murder",
  "rape",
  "assault",
  "abuse",
  "violence",
  "hate",
  "racism",
  "sexism",
  "discrimination",
  "harassment",
  "stupid",
  "idiot",
  "moron",
  "retard",
  "loser",
  "freak",
  "dumb",
  "ugly",
  "noob",
  "scrub",
  "trash",
  "garbage",
  "worthless",
];

// Add custom words to bad-words filter
badWordsFilter.addWords(...additionalBadWords);

// Add custom words to leo-profanity
leoProfanity.add(additionalBadWords);

/**
 * Enhanced censorship function using multiple third-party libraries
 * @param {string} text - Text to censor
 * @returns {object} - Censorship result with violations and cleaned text
 */
export const censorMessage = text => {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return {
      originalText: text || "",
      censoredText: text || "",
      violations: [],
      isClean: true,
      shouldBlock: false,
    };
  }

  const originalText = text.trim();
  const violations = [];
  let shouldBlock = false;

  // Check with bad-words library
  const hasProfanity = badWordsFilter.isProfane(originalText);

  // Check with leo-profanity library
  const leoCheck = leoProfanity.check(originalText);

  // Enhanced detection for compound words and partial matches
  const lowercaseText = originalText.toLowerCase();
  let hasCompoundProfanity = false;

  // Check if the text contains any bad words as substrings
  const badWordsToCheck = [
    "bitch",
    "fuck",
    "shit",
    "damn",
    "ass",
    "dick",
    "cock",
    "pussy",
    "cunt",
    "whore",
    "slut",
    "nigger",
    "faggot",
    "retard",
    "nazi",
    "hitler",
  ];

  for (const badWord of badWordsToCheck) {
    if (lowercaseText.includes(badWord)) {
      hasCompoundProfanity = true;
      break;
    }
  }

  // Combine results from both libraries and compound detection
  if (hasProfanity || leoCheck || hasCompoundProfanity) {
    shouldBlock = true;

    // Find specific violating words
    const words = originalText.split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
      if (
        badWordsFilter.isProfane(cleanWord) ||
        leoProfanity.check(cleanWord)
      ) {
        violations.push(word);
      }
    });

    // Check for compound profanity in individual words
    words.forEach(word => {
      const cleanWord = word.toLowerCase();
      for (const badWord of badWordsToCheck) {
        if (cleanWord.includes(badWord) && !violations.includes(word)) {
          violations.push(word);
        }
      }
    });
  }

  // Clean the text using both libraries
  let censoredText = originalText;
  if (shouldBlock) {
    // Use bad-words cleaning
    censoredText = badWordsFilter.clean(censoredText);
    // Use leo-profanity cleaning as backup
    censoredText = leoProfanity.clean(censoredText);
  }

  return {
    originalText,
    censoredText,
    violations,
    isClean: !shouldBlock,
    shouldBlock,
  };
};

/**
 * Strict name validation function for user registration
 * @param {string} name - Name to validate
 * @returns {object} - Validation result
 */
export const validateUserName = name => {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return {
      isValid: false,
      violations: ["empty"],
      message: "Name cannot be empty",
    };
  }

  const trimmedName = name.trim();

  // More strict validation for names - check both full name and individual words
  const hasProfanity = badWordsFilter.isProfane(trimmedName);
  const leoCheck = leoProfanity.check(trimmedName);

  // Enhanced detection for compound words and partial matches
  const lowercaseName = trimmedName.toLowerCase();
  let hasCompoundProfanity = false;

  // Check if the name contains any bad words as substrings
  const badWordsToCheck = [
    "bitch",
    "fuck",
    "shit",
    "damn",
    "ass",
    "dick",
    "cock",
    "pussy",
    "cunt",
    "whore",
    "slut",
    "nigger",
    "faggot",
    "retard",
    "nazi",
    "hitler",
  ];

  for (const badWord of badWordsToCheck) {
    if (lowercaseName.includes(badWord)) {
      hasCompoundProfanity = true;
      break;
    }
  }

  if (hasProfanity || leoCheck || hasCompoundProfanity) {
    const words = trimmedName.split(/\s+/);
    const violations = [];

    // Check individual words
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
      if (
        badWordsFilter.isProfane(cleanWord) ||
        leoProfanity.check(cleanWord)
      ) {
        violations.push(word);
      }
    });

    // If compound profanity detected but no individual words flagged, add the whole name
    if (hasCompoundProfanity && violations.length === 0) {
      violations.push(trimmedName);
    }

    return {
      isValid: false,
      violations,
      message:
        "Name contains inappropriate language. Please choose a different name.",
      suggestions: [
        "Use your real name or a professional nickname",
        "Avoid slang, profanity, or offensive terms",
        "Consider using initials if your name is being flagged",
      ],
    };
  }

  return {
    isValid: true,
    violations: [],
    message: "Name is appropriate",
  };
};

// Legacy function for backward compatibility
export const validateName = validateUserName;
