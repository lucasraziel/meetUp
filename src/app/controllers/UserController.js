import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findOne({
      where: { email: request.body.email },
    });

    if (userExists) {
      return response.status(400).json({ error: 'User already exists' });
    }

    const { id, name, email } = await User.create(request.body);

    return response.json({ id, name, email });
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      oldPassword: Yup.string(),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const { email, oldPassword } = request.body;

    const user = await User.findByPk(request.userId);

    if (email) {
      if (email !== user.email) {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
          return response.status(400).json({ error: 'User already exists' });
        }
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return response.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = await user.update(request.body);
    return response.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
