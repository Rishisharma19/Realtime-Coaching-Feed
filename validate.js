const validateFeed = (req, res, next) => {
  const { title, content, author } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("title is required");
  } else if (title.trim().length > 200) {
    errors.push("title cannot exceed 200 characters");
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push("content is required");
  } else if (content.trim().length > 2000) {
    errors.push("content cannot exceed 2000 characters");
  }

  if (!author || typeof author !== "string" || author.trim().length === 0) {
    errors.push("author is required");
  }

  const validCategories = ["motivation", "technique", "nutrition", "mindset", "recovery", "general"];
  if (req.body.category && !validCategories.includes(req.body.category)) {
    errors.push(`category must be one of: ${validCategories.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: "Validation failed", details: errors });
  }

  next();
};

module.exports = { validateFeed };
