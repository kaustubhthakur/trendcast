

const Community = require("../models/Community");




exports.createPost = async (req, res) => {

  try {

    const {
      content,
      imageUrl,
      videoUrl,
      matchId,
      playerPrediction,
      playerProbability
    } = req.body;

    const newPost = await Community.createPost({
      userId: req.user.id,
        username: req.user.username,
      content,
      imageUrl,
      videoUrl,
      matchId,
      playerPrediction,
      playerProbability
    });

    return res.status(201).json({
      success: true,
      post: newPost
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to create post"
    });
  }
};




exports.getAllPosts = async (req, res) => {

  try {

    const posts = await Community.getAllPosts();

    return res.status(200).json({
      success: true,
      posts
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts"
    });
  }
};


exports.getSinglePost = async (req, res) => {

  try {

    const post = await Community.getSinglePost(
      req.params.postId
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    return res.status(200).json({
      success: true,
      post
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch post"
    });
  }
};



exports.updatePost = async (req, res) => {

  try {

    const {
      content,
      imageUrl,
      videoUrl
    } = req.body;

    const updatedPost = await Community.updatePost({
      postId: req.params.postId,
      content,
      imageUrl,
      videoUrl
    });

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    return res.status(200).json({
      success: true,
      post: updatedPost
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to update post"
    });
  }
};



exports.deletePost = async (req, res) => {

  try {

    const deletedPost = await Community.deletePost(
      req.params.postId
    );

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete post"
    });
  }
};



exports.likePost = async (req, res) => {

  try {

    const updatedPost = await Community.likePost({
      postId: req.params.postId,
      userId: req.user.id
    });

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (updatedPost.alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: "Already liked"
      });
    }

    return res.status(200).json({
      success: true,
      post: updatedPost
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to like post"
    });
  }
};



exports.commentPost = async (req, res) => {

  try {

    const { comment } = req.body;

    const newComment = await Community.commentPost({
      postId: req.params.postId,
      userId: req.user.id,
      comment
    });

    return res.status(201).json({
      success: true,
      comment: newComment
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to comment"
    });
  }
};


exports.getComments = async (req, res) => {

  try {

    const comments = await Community.getComments(
      req.params.postId
    );

    return res.status(200).json({
      success: true,
      comments
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments"
    });
  }
};



exports.deleteComment = async (req, res) => {

  try {

    const deletedComment = await Community.deleteComment(
      req.params.commentId
    );

    if (!deletedComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted"
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment"
    });
  }
};



exports.getPostsByMatch = async (req, res) => {

  try {

    const posts = await Community.getPostsByMatch(
      req.params.matchId
    );

    return res.status(200).json({
      success: true,
      posts
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch match posts"
    });
  }
};



exports.getTrendingPosts = async (req, res) => {

  try {

    const posts = await Community.getTrendingPosts();

    return res.status(200).json({
      success: true,
      posts
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending posts"
    });
  }
};