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
  userId,
  voteType
}) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const matchExists = await client.query(
      `
      SELECT id
      FROM matches
      WHERE id = $1
      `,
      [matchId]
    );

    if (matchExists.rows.length === 0) {

      await client.query("ROLLBACK");

      return null;
    }

    const existingVote = await client.query(
      `
      SELECT vote_type
      FROM match_votes
      WHERE user_id = $1
      AND match_id = $2
      `,
      [userId, matchId]
    );

    if (existingVote.rows.length > 0) {

      const previousVote =
        existingVote.rows[0].vote_type;

      if (previousVote !== voteType) {

        let oldColumn;

        if (previousVote === "TEAM_A") {
          oldColumn = "vote_team_a";
        }
        else if (previousVote === "DRAW") {
          oldColumn = "vote_draw";
        }
        else {
          oldColumn = "vote_team_b";
        }

        await client.query(
          `
          UPDATE matches
          SET ${oldColumn} = ${oldColumn} - 1
          WHERE id = $1
          `,
          [matchId]
        );

        await client.query(
          `
          UPDATE match_votes
          SET vote_type = $1
          WHERE user_id = $2
          AND match_id = $3
          `,
          [voteType, userId, matchId]
        );
      }
      else {

        await client.query("ROLLBACK");

        return {
          alreadyVoted: true
        };
      }
    }
    else {

      await client.query(
        `
        INSERT INTO match_votes (
          user_id,
          match_id,
          vote_type
        )
        VALUES ($1,$2,$3)
        `,
        [userId, matchId, voteType]
      );
    }

    let column;

    if (voteType === "TEAM_A") {
      column = "vote_team_a";
    }
    else if (voteType === "DRAW") {
      column = "vote_draw";
    }
    else {
      column = "vote_team_b";
    }

    const updatedMatch = await client.query(
      `
      UPDATE matches
      SET ${column} = ${column} + 1
      WHERE id = $1
      RETURNING *
      `,
      [matchId]
    );

    if (updatedMatch.rows.length === 0) {

      await client.query("ROLLBACK");

      return null;
    }

    await client.query("COMMIT");

    return updatedMatch.rows[0];

  } catch (err) {

    await client.query("ROLLBACK");

    throw err;

  } finally {

    client.release();
  }
};
exports.getAllMatches = async () => {

  const res = await pool.query(
    `
    SELECT *
    FROM matches
    ORDER BY match_time ASC
    `
  );

  return res.rows;
};