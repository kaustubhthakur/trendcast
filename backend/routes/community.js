
const express = require("express");

const router = express.Router();

const verifyToken =
  require("../middlewares/auth");

const {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  getComments,
  deleteComment,
  getPostsByMatch,
  getTrendingPosts
} = require("../controllers/community");

router.post(
  "/posts",
  verifyToken,
  createPost
);

router.get(
  "/posts",
  getAllPosts
);

router.get(
  "/posts/:postId",
  getSinglePost
);

router.put(
  "/posts/:postId",
  verifyToken,
  updatePost
);


router.delete(
  "/posts/:postId",
  verifyToken,
  deletePost
);

router.put(
  "/posts/:postId/like",
  verifyToken,
  likePost
);

router.post(
  "/posts/:postId/comment",
  verifyToken,
  commentPost
);


router.get(
  "/posts/:postId/comments",
  getComments
);


router.delete(
  "/comments/:commentId",
  verifyToken,
  deleteComment
);


router.get(
  "/match/:matchId",
  getPostsByMatch
);


router.get(
  "/trending",
  getTrendingPosts
);



module.exports = router;