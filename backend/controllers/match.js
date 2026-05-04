const MatchModel = require('../models/Match')

 const createMatch = async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!teamAName || !teamBName) {
      return res.status(400).json({
        error: "Both teams are required"
      });
    }

    if (
      teamAWinProb == null ||
      drawProb == null ||
      teamBWinProb == null
    ) {
      return res.status(400).json({
        error: "Prediction probabilities are required"
      });
    }
    const totalProb = teamAWinProb + drawProb + teamBWinProb;
    if (Math.abs(totalProb - 100) > 1) {
      return res.status(400).json({
        error: "Probabilities should sum close to 100"
      });
    }

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