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

  async update(request, response) {
    const meetup = await Meetup.findByPk(request.params.id);

    if (!meetup) {
      return response.status(400).json({ error: 'Invalid id for meetup' });
    }

    if (request.user !== meetup.user) {
      return response
        .status(400)
        .json({ error: 'You can only update your meetups' });
    }

    if (isBefore(meetup.date, new Date())) {
      return response.status(400).json({
        error: 'You cannot change meetups from the past',
      });
    }

    if (request.body.date) {
      if (isBefore(parseISO(request.body.date), new Date())) {
        return response.status(400).json({
          error: 'You cannot change meetups to the past',
        });
      }
    }

    const newMeetup = await meetup.update(request.body);

    return response.json(newMeetup);
  }

  async index(request, response) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: request.userId,
      },
      attributes: ['title', 'description', 'localization', 'date'],
    });

    return response.json(meetups);
  }

  async delete(request, response) {
    const meetup = await Meetup.findByPk(request.params.id);

    if (!meetup) {
      return response.status(400).json({ error: 'Invalid id for meetup' });
    }

    if (request.user !== meetup.user) {
      return response
        .status(400)
        .json({ error: 'You can only update your meetups' });
    }

    if (isBefore(meetup.date, new Date())) {
      return response.status(400).json({
        error: 'You cannot change meetups from the past',
      });
    }

    meetup.destroy();

    return response.json({ deletedMeetup: meetup });
  }
}

export default new MeetupController();
