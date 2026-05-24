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
 * Administrative action recommendations mapped to issue types
 */
const OFFICER_ACTIONS = {
  'Water Supply': 'Send the maintenance/water supply team to inspect and repair the leakage immediately.',
  'Road Infrastructure': 'Dispatch road maintenance engineers to inspect and repair the damaged road surface or potholes.',
  'Electricity': 'Coordinate with the electricity department to inspect and resolve the power failure/faulty streetlights.',
  'Waste Management': 'Send the municipal waste collection team to clear the accumulated garbage and waste from the site.',
  'Sanitation': 'Dispatch sanitation and sewerage staff to inspect and clear the drainage or sewage blockage.',
  'Education': 'Initiate inspection of the educational facility and contact administrative authorities for resolution.',
  'Healthcare': 'Alert local healthcare authorities to inspect the facility or address the medical service issue.',
  'Corruption': 'Forward the case to the anti-corruption cell or vigilance department for a formal inquiry.',
  'Law Enforcement': 'Alert the local police station to patrol the area or register a formal investigation.',
  'Public Safety': 'Deploy safety officers to inspect the hazard and establish protective cordons or warnings.',
  'Illegal Construction': 'Send the building inspection team to check construction permits and issue stop-work orders.',
  'Infrastructure': 'Assign structural engineers to inspect the public facility/building and report structural concerns.',
  'Public Amenities': 'Notify the parks and recreation department to inspect and repair the public amenity/facility.',
  'Public Transport': 'Notify the transit department to inspect transit services or address the concern.',
  'Traffic Management': 'Request traffic police or signaling technicians to address signal malfunction or traffic congestion.',
  'Noise Pollution': 'Send environmental inspectors to measure noise levels and enforce compliance.',
  'Environmental': 'Alert the environmental protection division to investigate the pollution source.',
  'Disaster Management': 'Activate emergency response and dispatch disaster management forces immediately.',
  'Public Distribution': 'Instruct the food and civil supplies inspector to audit the ration shop/fair price shop.',
  'Social Welfare': 'Forward to the social welfare officer to review eligibility and process benefits.',
  'Government Services': 'Direct the public service officer to expedite processing of the pending application/license.',
  'General Complaint': 'Assign a field officer to inspect the reported issue and contact the complainant for details.'
};

/**
 * Clean complaint text by stripping common conversational preambles and formatting duration/issues
 */
function cleanComplaintText(text) {
  if (!text) return '';
  let cleaned = text.trim();
  
  let matchFound = true;
  while (matchFound) {
    let temp = cleaned;
    
    // Remove greetings
    temp = temp.replace(/^(?:hello|hi|dear\s+(?:sir|madam|officer)|respected\s+(?:sir|madam)|sir|madam)\b\s*[,.-]*\s*/i, '');
    
    // Remove report preambles
    temp = temp.replace(/^(?:i\s+(?:want|would\s+like|wish)\s+to\s+report|i\s+am\s+writing\s+to\s+report|i\s+wish\s+to\s+report|this\s+is\s+to\s+report|this\s+is\s+regarding|regarding|complaint\s+(?:about|regarding)|report\s+(?:about|regarding))\b\s*[,.-]*\s*/i, '');
    
    // Remove existential preambles
    temp = temp.replace(/^(?:there\s+is\s+a|there\s+is\s+an|there\s+are|we\s+are\s+facing\s+a?|i\s+am\s+facing\s+a?|there\s+has\s+been\s+a?|we\s+have\s+a?|i\s+have\s+a?)\b\s*/i, '');
    
    // Remove problem headers
    temp = temp.replace(/^(?:issue\s+of|problem\s+of|complaint\s+of|concern\s+of|the\s+problem\s+is\s+that|my\s+complaint\s+is\s+that|my\s+issue\s+is\s+that)\b\s*/i, '');

    // Remove please/kindly and leading that/transitional words
    temp = temp.replace(/^(?:please|kindly|that\s+a?|that)\b\s*[,.-]*\s*/i, '');

    if (temp === cleaned) {
      matchFound = false;
    } else {
      cleaned = temp.trim();
    }
  }
  
  // Replace suffix patterns to make it concise (e.g. "water leakage problem" -> "water leakage reported")
  cleaned = cleaned.replace(/\b(?:water\s+leakage|leakage|sewage|drainage|power\s+cut|power\s+outage|electricity\s+issue|garbage\s+dump|street\s*light|pothole)\s+(?:problem|issue|complaint|trouble)\b/i, (match) => {
    const words = match.split(/\s+/);
    words[words.length - 1] = 'reported';
    return words.join(' ');
  });
  
  // Format temporal phrases
  cleaned = cleaned.replace(/\b(?:for\s+the\s+past|for\s+the\s+last|for\s+last|since|from|last)\s+(\d+)\s+days\b/i, 'for $1 days');
  
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }
  
  return cleaned;
}

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
      summary: 'No description provided',
      officerAction: OFFICER_ACTIONS['General Complaint']
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
  let summary = cleanComplaintText(text);
  if (!summary) {
    summary = text.trim();
  }
  if (summary.length > 200) {
    const truncated = summary.substring(0, 200);
    const lastPeriod = truncated.lastIndexOf('.');
    summary = lastPeriod > 100 ? truncated.substring(0, lastPeriod + 1) : truncated + '...';
  }

  const officerAction = OFFICER_ACTIONS[issueType] || OFFICER_ACTIONS['General Complaint'];

  return {
    issueType,
    severity,
    location,
    summary,
    officerAction
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
