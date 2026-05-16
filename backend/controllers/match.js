const MatchModel = require('../models/Match')
const  { runPrediction } = require("../services/mlServices");
const createMatch = async (req, res) => {
  try {
    const {
      teamAName,
      teamALogo,
      teamBName,
      teamBLogo,
      matchTime
    } = req.body;

    if (!teamAName || !teamBName) {
      return res.status(400).json({
        error: "Both teams are required"
      });
    }

    if (
      teamAName.trim().toLowerCase() ===
      teamBName.trim().toLowerCase()
    ) {
      return res.status(400).json({
        error: "Both teams cannot be the same"
      });
    }

    const prediction = await runPrediction(teamAName, teamBName);

    if (prediction.error) {
      return res.status(400).json({
        error: prediction.error
      });
    }

    const {
      teamAWinProb,
      drawProb,
      teamBWinProb
    } = prediction;

    const teamAGoals = Math.round(Number(prediction.teamAGoals));
    const teamBGoals = Math.round(Number(prediction.teamBGoals));

    const predictedResult =
      teamAGoals > teamBGoals
        ? "TEAM_A"
        : teamBGoals > teamAGoals
        ? "TEAM_B"
        : "DRAW";

    const match = await MatchModel.CreateMatch({
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

    return res.status(201).json({
      message: "Match created successfully",
      data: match
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};

 const voteMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { voteType } = req.body;

    if (!voteType) {
      return res.status(400).json({
        error: "voteType is required"
      });
    }

    const allowedVotes = ["TEAM_A", "DRAW", "TEAM_B"];
    if (!allowedVotes.includes(voteType)) {
      return res.status(400).json({
        error: "Invalid vote type"
      });
    }

    const updatedMatch = await MatchModel.voteMatch({
      matchId,
      voteType
    });

    if (!updatedMatch) {
      return res.status(404).json({
        error: "Match not found"
      });
    }

    return res.status(200).json({
      message: "Vote recorded successfully",
      data: updatedMatch
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
};
module.exports = {createMatch,voteMatch}