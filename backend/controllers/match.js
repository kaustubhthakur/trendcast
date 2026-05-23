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

    const plUrl =
      "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED";

    const laligaUrl =
      "https://api.football-data.org/v4/competitions/PD/matches?status=SCHEDULED";

    const [plResponse, laligaResponse] =
      await Promise.all([

        axios.get(plUrl, {
          headers: {
            "X-Auth-Token": API_KEY
          }
        }),

        axios.get(laligaUrl, {
          headers: {
            "X-Auth-Token": API_KEY
          }
        })
      ]);

    const fixtures = [

      ...plResponse.data.matches,

      ...laligaResponse.data.matches
    ];

    if (!fixtures || fixtures.length === 0) {

      return res.status(404).json({
        error: "No scheduled matches found"
      });
    }

    const createdMatches = [];

    for (const fixture of fixtures) {

      const teamAName =
        normalizeTeamName(
          fixture.homeTeam.name
        );

      const teamBName =
        normalizeTeamName(
          fixture.awayTeam.name
        );

      const teamALogo =
        TEAM_LOGOS[teamAName] || null;

      const teamBLogo =
        TEAM_LOGOS[teamBName] || null;

      const matchTime =
        fixture.utcDate || null;

      const competitionCode =
        fixture.competition.code;

      if (

        teamAName
          .trim()
          .toLowerCase()

        ===

        teamBName
          .trim()
          .toLowerCase()

      ) {
        continue;
      }

      const existingMatch =
        await MatchModel.findExistingMatch({

          teamAName,

          teamBName,

          matchTime
        });

      if (existingMatch) {

        console.log(

          `Skipping existing match ${teamAName} vs ${teamBName}`
        );

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

        Number(
          prediction.teamAGoals
        )
      );

      const teamBGoals = Math.round(

        Number(
          prediction.teamBGoals
        )
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

          matchTime,

          league:
            competitionCode === "PL"
              ? "Premier League"
              : "La Liga"
        });

      createdMatches.push(match);
    }

    const allMatches =
      await MatchModel.getAllMatches();

    return res.status(201).json({

      message:
        "Matches processed successfully",

      total:
        allMatches.length,

      created:
        createdMatches.length,

      data:
        allMatches
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