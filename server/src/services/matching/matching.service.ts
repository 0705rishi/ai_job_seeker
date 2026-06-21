import { ISeekerProfile } from "../../models/profile.model";
import { IJob } from "../../models/job.model";

export interface MatchBreakdown {
  score: number;
  semantic: number;
  skillOverlap: number;
  contextBoost: number;
  matchedSkills: string[];
  missingSkills: string[];
  locationMatch: boolean;
  workModeMatch: boolean;
  explanation: string;
}

/**
 * Calculates the cosine similarity between two numeric vectors.
 * Assumes vectors have equal lengths.
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Generates a clean deterministic explanation sentence for the match.
 */
export const getMatchExplanation = (
  matchedSkills: string[],
  jobTitle: string,
  locationMatch: boolean,
  workModeMatch: boolean
): string => {
  if (matchedSkills.length > 0) {
    const skillsList = matchedSkills.slice(0, 3).join(", ");
    const remaining = matchedSkills.length > 3 ? ` and ${matchedSkills.length - 3} others` : "";
    return `Your skills in ${skillsList}${remaining} are a great fit for this ${jobTitle} role.`;
  }

  if (workModeMatch && locationMatch) {
    return `This role matches your location and work mode preferences perfectly.`;
  }

  return `This role aligns with your career preferences and background.`;
};

/**
 * Calculates a match score and breakdown between a seeker profile and a job.
 */
export const calculateJobMatch = (
  profile: ISeekerProfile,
  job: IJob
): MatchBreakdown => {
  // 1. Semantic Similarity (55%)
  const profileEmbedding = profile.embedding || [];
  const jobEmbedding = job.embedding || [];

  const rawCosine = cosineSimilarity(profileEmbedding, jobEmbedding);
  // Normalize cosine similarity (clamped between 0 and 1)
  const semantic = Math.max(0, Math.min(1, rawCosine));

  // 2. Skill Overlap (35%)
  const jobSkills = job.skills ? job.skills.map((s) => s.toLowerCase().trim()) : [];
  const profileSkills = profile.skills ? profile.skills.map((s) => s.toLowerCase().trim()) : [];

  let matchedSkills: string[] = [];
  let missingSkills: string[] = [];

  if (jobSkills.length === 0) {
    matchedSkills = [];
    missingSkills = [];
  } else {
    jobSkills.forEach((skill) => {
      // Direct or substring match checks
      const isMatched = profileSkills.some(
        (pSkill) => pSkill === skill || pSkill.includes(skill) || skill.includes(pSkill)
      );

      // Map back to original casing from job.skills
      const originalSkill = job.skills.find((s) => s.toLowerCase().trim() === skill) || skill;

      if (isMatched) {
        matchedSkills.push(originalSkill);
      } else {
        missingSkills.push(originalSkill);
      }
    });
  }

  const skillOverlap = jobSkills.length === 0 ? 1.0 : matchedSkills.length / jobSkills.length;

  // 3. Context Boost (10%)
  // Location Match (0.5 max)
  const jobLocation = job.location ? job.location.toLowerCase().trim() : "";
  const prefLocations = profile.preferences?.locations
    ? profile.preferences.locations.map((l) => l.toLowerCase().trim())
    : [];

  const isRemoteJob = jobLocation === "remote" || (job.workMode && job.workMode.toLowerCase().trim() === "remote");
  const wantsRemote = prefLocations.includes("remote");

  const locationMatch =
    prefLocations.length === 0 ||
    prefLocations.some((loc) => jobLocation.includes(loc) || loc.includes(jobLocation)) ||
    (isRemoteJob && wantsRemote);

  // Work Mode Match (0.5 max)
  const jobWorkMode = job.workMode ? job.workMode.toLowerCase().trim() : "";
  const prefWorkMode = profile.preferences?.workMode
    ? profile.preferences.workMode.toLowerCase().trim()
    : "any";

  const workModeMatch =
    prefWorkMode === "any" ||
    prefWorkMode === jobWorkMode;

  const contextBoost = (locationMatch ? 0.5 : 0.0) + (workModeMatch ? 0.5 : 0.0);

  // Calculate final score (0 - 100)
  const score = Math.round(
    100 * (0.55 * semantic + 0.35 * skillOverlap + 0.10 * contextBoost)
  );

  const explanation = getMatchExplanation(
    matchedSkills,
    job.title,
    locationMatch,
    !!workModeMatch
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    semantic,
    skillOverlap,
    contextBoost,
    matchedSkills,
    missingSkills,
    locationMatch,
    workModeMatch: !!workModeMatch,
    explanation,
  };
};
