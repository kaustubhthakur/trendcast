const pool = require("../db");



exports.createPost = async ({ userId, username, content, imageUrl, videoUrl, matchId, playerPrediction, playerProbability }) => {
  const res = await pool.query(
    `INSERT INTO community_posts (user_id, username, content, image_url, video_url, match_id, player_prediction, player_probability)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [userId, username, content, imageUrl, videoUrl, matchId, playerPrediction, playerProbability]
  );
  return res.rows[0];
};

exports.getAllPosts = async () => {

  const res = await pool.query(
    `
    SELECT
      cp.*,
      u.username,
      u.profile_pic
    FROM community_posts cp

    JOIN users u
    ON cp.user_id = u.id

    ORDER BY cp.created_at DESC
    `
  );

  return res.rows;
};


exports.getSinglePost = async (postId) => {

  const res = await pool.query(
    `
    SELECT
      cp.*,
      u.username,
      u.profile_pic
    FROM community_posts cp

    JOIN users u
    ON cp.user_id = u.id

    WHERE cp.id = $1

    LIMIT 1
    `,
    [postId]
  );

  return res.rows[0];
};


exports.updatePost = async ({
  postId,
  content,
  imageUrl,
  videoUrl
}) => {

  const res = await pool.query(
    `
    UPDATE community_posts
    SET
      content = $1,
      image_url = $2,
      video_url = $3
    WHERE id = $4

    RETURNING *
    `,
    [
      content,
      imageUrl,
      videoUrl,
      postId
    ]
  );

  return res.rows[0];
};

exports.deletePost = async (postId) => {

  const res = await pool.query(
    `
    DELETE FROM community_posts
    WHERE id = $1

    RETURNING *
    `,
    [postId]
  );

  return res.rows[0];
};

exports.likePost = async ({
  postId,
  userId
}) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const existingLike = await client.query(
      `
      SELECT *
      FROM community_post_likes
      WHERE post_id = $1
      AND user_id = $2
      `,
      [postId, userId]
    );

    if (existingLike.rows.length > 0) {

      await client.query("ROLLBACK");

      return {
        alreadyLiked: true
      };
    }

    await client.query(
      `
      INSERT INTO community_post_likes (
        post_id,
        user_id
      )
      VALUES ($1,$2)
      `,
      [postId, userId]
    );

    const updatedPost = await client.query(
      `
      UPDATE community_posts
      SET likes_count = likes_count + 1
      WHERE id = $1

      RETURNING *
      `,
      [postId]
    );

    await client.query("COMMIT");

    return updatedPost.rows[0];

  } catch (err) {

    await client.query("ROLLBACK");
    throw err;

  } finally {

    client.release();
  }
};


exports.commentPost = async ({
  postId,
  userId,
  comment
}) => {

  const res = await pool.query(
    `
    INSERT INTO community_comments (
      post_id,
      user_id,
      comment
    )
    VALUES ($1,$2,$3)

    RETURNING *
    `,
    [
      postId,
      userId,
      comment
    ]
  );

  return res.rows[0];
};


exports.getComments = async (postId) => {

  const res = await pool.query(
    `
    SELECT
      cc.*,
      u.username,
      u.profile_pic

    FROM community_comments cc

    JOIN users u
    ON cc.user_id = u.id

    WHERE cc.post_id = $1

    ORDER BY cc.created_at DESC
    `,
    [postId]
  );

  return res.rows;
};


exports.deleteComment = async (commentId) => {

  const res = await pool.query(
    `
    DELETE FROM community_comments
    WHERE id = $1

    RETURNING *
    `,
    [commentId]
  );

  return res.rows[0];
};


exports.getPostsByMatch = async (matchId) => {

  const res = await pool.query(
    `
    SELECT
      cp.*,
      u.username,
      u.profile_pic

    FROM community_posts cp

    JOIN users u
    ON cp.user_id = u.id

    WHERE cp.match_id = $1

    ORDER BY cp.created_at DESC
    `,
    [matchId]
  );

  return res.rows;
};


exports.getTrendingPosts = async () => {

  const res = await pool.query(
    `
    SELECT
      cp.*,
      u.username,
      u.profile_pic

    FROM community_posts cp

    JOIN users u
    ON cp.user_id = u.id

    ORDER BY cp.likes_count DESC, cp.created_at DESC

    LIMIT 20
    `
  );

  return res.rows;
};
