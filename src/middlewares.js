import sharp from 'sharp';

const createThumbnail = async (req, res, next) => {
  try {
    if (!req.file) {
      next('Kuvaa ei löydy');
    }
    let extension = 'jpg';
    if (req.file.mimetype === 'image/png') {
      extension = 'png';
    }
    await sharp(req.file.path)
      .resize(100, 100)
      .toFile(`${req.file.path}_thumb.${extension}`);
    next();
  } catch (error) {
    next('Error: ' + error);
  }
};

export default createThumbnail;
