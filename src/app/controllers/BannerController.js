import Banner from '../models/Banner';

class BannerController {
  async store(request, response) {
    const { originalname: name, filename: path } = request.file;

    const banner = await Banner.create({
      name,
      path,
    });

    return response.json(banner);
  }
}

export default new BannerController();
