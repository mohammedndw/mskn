const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/response');
const path = require('path');

class UploadController {
  // Upload property image
  uploadPropertyImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      return ApiResponse.error(res, 'No file uploaded', 400);
    }

    // Generate the URL for the uploaded file
    const imageUrl = `/uploads/properties/${req.file.filename}`;

    return ApiResponse.success(
      res,
      {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: imageUrl
      },
      'Image uploaded successfully',
      201
    );
  });
}

module.exports = new UploadController();
