const pool = require("../db");

exports.CreateMatch = async ({
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
}) => {
  const res = await pool.query(
    `INSERT INTO matches (
      team_a_name,
      team_a_logo,
      team_b_name,
      team_b_logo,
      team_a_win_prob,
      draw_prob,
      team_b_win_prob,
      predicted_result,
      team_a_goals,
      team_b_goals,
      match_time
    ) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
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
    ]
  );

  return res.rows[0];
};

exports.voteMatch = async ({ matchId, voteType }) => {
  let column;

  if (voteType === "TEAM_A") column = "vote_team_a";
  else if (voteType === "DRAW") column = "vote_draw";
  else if (voteType === "TEAM_B") column = "vote_team_b";
  else throw new Error("Invalid vote type");

  const res = await pool.query(
    `UPDATE matches
     SET ${column} = ${column} + 1
     WHERE id = $1
     RETURNING *`,
    [matchId]
  );

  return res.rows[0];
};