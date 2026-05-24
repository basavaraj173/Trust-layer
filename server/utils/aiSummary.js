// ============================================================
// AI Summary Utility – Mock LLM Summarization
// ============================================================

/**
 * Keyword maps for issue type classification
 */
const ISSUE_KEYWORDS = {
  'water': 'Water Supply',
  'pipe': 'Water Supply',
  'tap': 'Water Supply',
  'drinking': 'Water Supply',
  'borewell': 'Water Supply',
  'road': 'Road Infrastructure',
  'pothole': 'Road Infrastructure',
  'highway': 'Road Infrastructure',
  'bridge': 'Road Infrastructure',
  'footpath': 'Road Infrastructure',
  'electricity': 'Electricity',
  'power': 'Electricity',
  'transformer': 'Electricity',
  'street light': 'Electricity',
  'streetlight': 'Electricity',
  'light': 'Electricity',
  'garbage': 'Waste Management',
  'waste': 'Waste Management',
  'trash': 'Waste Management',
  'dump': 'Waste Management',
  'sewage': 'Sanitation',
  'drain': 'Sanitation',
  'drainage': 'Sanitation',
  'toilet': 'Sanitation',
  'sanitation': 'Sanitation',
  'school': 'Education',
  'teacher': 'Education',
  'education': 'Education',
  'college': 'Education',
  'hospital': 'Healthcare',
  'doctor': 'Healthcare',
  'medicine': 'Healthcare',
  'health': 'Healthcare',
  'clinic': 'Healthcare',
  'ambulance': 'Healthcare',
  'corruption': 'Corruption',
  'bribe': 'Corruption',
  'illegal': 'Corruption',
  'police': 'Law Enforcement',
  'crime': 'Law Enforcement',
  'theft': 'Law Enforcement',
  'safety': 'Public Safety',
  'accident': 'Public Safety',
  'dangerous': 'Public Safety',
  'construction': 'Illegal Construction',
  'building': 'Infrastructure',
  'park': 'Public Amenities',
  'playground': 'Public Amenities',
  'bus': 'Public Transport',
  'transport': 'Public Transport',
  'traffic': 'Traffic Management',
  'signal': 'Traffic Management',
  'noise': 'Noise Pollution',
  'pollution': 'Environmental',
  'flood': 'Disaster Management',
  'fire': 'Disaster Management',
  'ration': 'Public Distribution',
  'pension': 'Social Welfare',
  'aadhaar': 'Government Services',
  'passport': 'Government Services',
  'license': 'Government Services',
  'rto': 'Government Services'
};

/**
 * High severity keywords
 */
const HIGH_SEVERITY_WORDS = [
  'urgent', 'emergency', 'danger', 'dangerous', 'death', 'died',
  'collapse', 'collapsed', 'flood', 'flooding', 'fire', 'burning',
  'accident', 'injured', 'injury', 'critical', 'immediate',
  'life-threatening', 'unsafe', 'toxic', 'contaminated', 'electrocution',
  'children at risk', 'epidemic', 'outbreak'
];

/**
 * Medium severity keywords
 */
const MEDIUM_SEVERITY_WORDS = [
  'broken', 'damaged', 'problem', 'issue', 'complaint', 'not working',
  'poor', 'bad', 'weeks', 'days', 'suffering', 'inconvenience',
  'harassment', 'neglect', 'delay', 'pending', 'ignored'
];

/**
 * Common Indian location names for extraction
 */
const LOCATION_PATTERNS = [
  /(?:in|at|near|from|of)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})/g,
  /([A-Z][a-z]+(?:nagar|puram|palli|abad|pur|wadi|gudi|pet|peta|halli|kere))/g,
  /(?:ward|block|sector|phase|stage)\s*(?:no\.?\s*)?(\d+)/gi
];

/**
 * Generate an AI-style summary from complaint text
 * @param {string} text - The complaint text
 * @returns {Object} - Structured summary
 */
function generateSummary(text) {
  if (!text || text.trim().length === 0) {
    return {
      issueType: 'General Complaint',
      severity: 'medium',
      location: 'Not specified',
      summary: 'No description provided'
    };
  }

  const lowerText = text.toLowerCase();

  // ── Issue Type Classification ──
  let issueType = 'General Complaint';
  let maxScore = 0;
  const typeCounts = {};

  for (const [keyword, type] of Object.entries(ISSUE_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      if (typeCounts[type] > maxScore) {
        maxScore = typeCounts[type];
        issueType = type;
      }
    }
  }

  // ── Severity Detection ──
  let severity = 'low';
  if (HIGH_SEVERITY_WORDS.some(w => lowerText.includes(w))) {
    severity = 'high';
  } else if (MEDIUM_SEVERITY_WORDS.some(w => lowerText.includes(w))) {
    severity = 'medium';
  }

  // ── Location Extraction ──
  let location = 'Not specified';
  for (const pattern of LOCATION_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    const match = regex.exec(text);
    if (match && match[1]) {
      location = match[1].trim();
      break;
    }
  }

  // ── Summary Generation ──
  let summary = text.trim();
  if (summary.length > 200) {
    // Truncate at sentence boundary
    const truncated = summary.substring(0, 200);
    const lastPeriod = truncated.lastIndexOf('.');
    summary = lastPeriod > 100 ? truncated.substring(0, lastPeriod + 1) : truncated + '...';
  }

  return {
    issueType,
    severity,
    location,
    summary
  };
}

/**
 * Basic spam detection
 * @param {string} text - Text to check
 * @returns {boolean} - true if spam detected
 */
function isSpam(text) {
  if (!text) return true;
  const cleaned = text.trim();

  // Too short
  if (cleaned.length < 10) return true;

  // Repeated characters
  if (/(.)\1{10,}/.test(cleaned)) return true;

  // All caps with no real words
  if (cleaned === cleaned.toUpperCase() && cleaned.length > 50 && !/\s/.test(cleaned)) return true;

  return false;
}

module.exports = { generateSummary, isSpam };
