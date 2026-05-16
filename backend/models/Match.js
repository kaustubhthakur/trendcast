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
    `
    INSERT INTO matches (
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
      match_time,
      vote_team_a,
      vote_draw,
      vote_team_b
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,0,0,0
    )

    ON CONFLICT (
      team_a_name,
      team_b_name,
      match_time
    )

    DO UPDATE SET
      team_a_logo = EXCLUDED.team_a_logo,
      team_b_logo = EXCLUDED.team_b_logo,
      team_a_win_prob = EXCLUDED.team_a_win_prob,
      draw_prob = EXCLUDED.draw_prob,
      team_b_win_prob = EXCLUDED.team_b_win_prob,
      predicted_result = EXCLUDED.predicted_result,
      team_a_goals = EXCLUDED.team_a_goals,
      team_b_goals = EXCLUDED.team_b_goals

    RETURNING *
    `,
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

exports.voteMatch = async ({
  matchId,
  voteType
}) => {

  let column;

  if (voteType === "TEAM_A") {
    column = "vote_team_a";
  }
  else if (voteType === "DRAW") {
    column = "vote_draw";
  }
  else if (voteType === "TEAM_B") {
    column = "vote_team_b";
  }
  else {
    throw new Error("Invalid vote type");
  }

  const res = await pool.query(
    `
    UPDATE matches
    SET ${column} = ${column} + 1
    WHERE id = $1
    RETURNING *
    `,
    [matchId]
  );

  return res.rows[0];
};

exports.getAllMatches = async () => {

  const res = await pool.query(`
    SELECT *
    FROM matches
    ORDER BY match_time ASC
  `);

  return res.rows;
};