require("dotenv").config();

const { v4: uuidv4 } = require("uuid");

const MatchModel = require("../models/Match");
const axios = require("axios");

const { runPrediction } = require("../services/mlServices");

const {
  TEAM_LOGOS,
  normalizeTeamName
} = require("../config/teams");

const API_KEY = process.env.FOOTBALL_API_KEY;

const createMatch = async (req, res) => {

  try {

    const alreadyExists =
      await MatchModel.getAllMatches();

    if (alreadyExists.length > 0) {

      return res.status(200).json({
        message:
          "Matches already exist, fetched from database",
        total: alreadyExists.length,
        data: alreadyExists
      });
    }

    const url =
      "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED";

    const response = await axios.get(url, {
      headers: {
        "X-Auth-Token": API_KEY
      }
    });

    const fixtures = response.data.matches;

    if (!fixtures || fixtures.length === 0) {

      return res.status(404).json({
        error: "No scheduled matches found"
      });
    }

    const createdMatches = [];

    for (const fixture of fixtures) {

      const teamAName = normalizeTeamName(
        fixture.homeTeam.name
      );

      const teamBName = normalizeTeamName(
        fixture.awayTeam.name
      );

      const teamALogo =
        TEAM_LOGOS[teamAName] || null;

      const teamBLogo =
        TEAM_LOGOS[teamBName] || null;

      const matchTime =
        fixture.utcDate || null;

      if (
        teamAName.trim().toLowerCase() ===
        teamBName.trim().toLowerCase()
      ) {
        continue;
      }

      const prediction =
        await runPrediction(
          teamAName,
          teamBName
        );

      if (prediction.error) {

        console.log(
          `Prediction failed for ${teamAName} vs ${teamBName}`
        );

        continue;
      }

      const {
        teamAWinProb,
        drawProb,
        teamBWinProb
      } = prediction;

      const teamAGoals = Math.round(
        Number(prediction.teamAGoals)
      );

      const teamBGoals = Math.round(
        Number(prediction.teamBGoals)
      );

      const predictedResult =
        teamAGoals > teamBGoals
          ? "TEAM_A"
          : teamBGoals > teamAGoals
          ? "TEAM_B"
          : "DRAW";

      const match =
        await MatchModel.CreateMatch({

          id: uuidv4(),

          teamAName,
          teamALogo,

          teamBName,
          teamBLogo,

          teamAWinProb,
          drawProb,
          teamBWinProb,

          predictedResult,

          teamAGoals,
          teamBGoals,

          matchTime
        });

      createdMatches.push(match);
    }

    return res.status(201).json({
      message:
        "Future matches created successfully",
      total: createdMatches.length,
      data: createdMatches
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};
const getAllMatches = async (req, res) => {
  try {
    const matches = await MatchModel.getAllMatches();
    return res.status(200).json({
      message: "Matches fetched successfully",
      total: matches.length,
      data: matches
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const voteMatch = async (req, res) => {

  try {

    const matchId = req.params.id;

    const userId = req.user.id;

    const { voteType } = req.body;

    const allowedVotes = [
      "TEAM_A",
      "DRAW",
      "TEAM_B"
    ];

    if (!allowedVotes.includes(voteType)) {

      return res.status(400).json({
        error: "Invalid vote type"
      });
    }

    const updatedMatch =
      await MatchModel.voteMatch({
        matchId,
        userId,
        voteType
      });

   if (!updatedMatch) {

  return res.status(404).json({
    error: "Match not found"
  });
}

return res.status(200).json({
  message: "Vote updated successfully",
  data: updatedMatch
});

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};

module.exports = {
  createMatch,
  voteMatch,
  getAllMatches
};