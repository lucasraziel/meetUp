import * as Yup from 'yup';
import { isBefore, parseISO, endOfHour } from 'date-fns';
import Meetup from '../models/Meetup';
import Banner from '../models/Banner';

class MeetupController {
  async store(request, response) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      banner: Yup.number().required(),
      date: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const date = endOfHour(parseISO(request.body.date));

    if (isBefore(date, new Date())) {
      return response.status(400).json({
        error: 'You can only create a meetup for the next day, at least',
      });
    }

    request.body.user_id = request.userId;

    const checkIfImageExists = await Banner.findByPk(request.body.banner);

    if (!checkIfImageExists) {
      return response
        .status(400)
        .json({ error: 'There is no banner in database' });
    }

    const meetup = await Meetup.create(request.body);

    return response.json(meetup);
  }
}

export default new MeetupController();
