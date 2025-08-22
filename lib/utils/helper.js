import { extractJsonBlock } from "./cleanCodeBlock";

export async function deriveStatus(duration, current_duration, callTime) {
  console.log("duration, current_duration, callTime:::", duration, current_duration, callTime);

  // Ensure all values are numbers
  const totalDuration = Number(duration);
  const usedDuration = Number(current_duration);
  const liveCallTime = Number(callTime);

  // If any required number is invalid, assume in-progress
  if (isNaN(totalDuration) || isNaN(usedDuration) || isNaN(liveCallTime)) {
    return 'in-progress';
  }

  // Compare total to accumulated time
  return Math.floor(usedDuration + liveCallTime) >= Math.floor(totalDuration)
    ? 'completed'
    : 'in-progress';
}


export function parseGeneratedReport(rawData) {
  try {
    const jsonString = extractJsonBlock(rawData);
    console.log("🔍 Extracted JSON string length:", jsonString.length);
    console.log("🔍 JSON string preview:", jsonString.substring(0, 200) + "...");
    
    if (!jsonString || jsonString.length === 0) {
      console.error("❌ No JSON block found in report data");
      return null;
    }
    
    const parsed = JSON.parse(jsonString);
    console.log("✅ Successfully parsed JSON report");
    return parsed;
  } catch (err) {
    console.error("❌ Failed to parse JSON block from report data:", err);
    console.error("❌ Raw data that failed to parse:", rawData);
    
    // Try to extract what we can for a partial save
    try {
      // Look for final_verdict in the raw data even if incomplete
      const scoreMatch = rawData.match(/"score"\s*:\s*"?(\d+)"?/);
      const recommendationMatch = rawData.match(/"recommendation"\s*:\s*"(YES|NO)"/i);
      
      if (scoreMatch && recommendationMatch) {
        console.log("🔄 Attempting fallback parsing for partial data");
        return {
          final_verdict: {
            score: scoreMatch[1],
            recommendation: recommendationMatch[1]
          },
          // Add minimal structure so the save doesn't fail
          overall_summary: "Report was partially generated due to response truncation",
          Skill_Evaluation: {},
          reasons: [],
          Question_Wise_Feedback: []
        };
      }
    } catch (fallbackErr) {
      console.error("❌ Fallback parsing also failed:", fallbackErr);
    }
    
    return null;
  }
}

export function extractScoreAndRecommendation(result) {
  const scoreRaw = result?.final_verdict?.score;
  const recommendationRaw = result?.final_verdict?.recommendation;

  const score =
    typeof scoreRaw === "number" || typeof scoreRaw === "string"
      ? String(scoreRaw)
      : "0";

  const recommendation =
    typeof recommendationRaw === "string"
      ? recommendationRaw.toLowerCase() === "yes"
      : false;

  return { score, recommendation };
}

export function flattenCommaArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return '';
  }

  return arr
    .flatMap(item => typeof item === 'string' ? item.split(',') : []) // only process strings
    .map(s => s.trim())
    .filter(Boolean) // remove empty strings
    .filter((val, i, self) => self.indexOf(val) === i) // remove duplicates
    .join(', ');
};

export function calculatePerformance(overallScore){
  if(overallScore <= 4){
    return {
      tag: 'Poor',
      status: false,
      color: 'bg-red-400'
    }
  }
  if(overallScore > 4 && overallScore <= 6){
    return {
      tag: 'Average',
      status: false,
      color: 'bg-red-400'
    }
  }
  if(overallScore > 6 && overallScore <= 8){
    return {
      tag: 'Good',
      status: true,
      color: 'bg-teal-400'
    }
  }
  if(overallScore > 8 && overallScore <= 10){
    return {
      tag: 'Excellent',
      status: true,
      color: 'bg-teal-400'
    }
  }
}

export function formatDate(date){
  const startedAt = "2025-05-22T14:42:41.05+00:00";
  const formattedDate = new Date(date).toLocaleString("en-US", {
    dateStyle: "medium", // e.g. "May 22, 2025"
    timeStyle: "short",  // e.g. "2:42 PM"
  });
  return formattedDate
}